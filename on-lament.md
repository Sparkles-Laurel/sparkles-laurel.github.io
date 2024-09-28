# About Application Configuration and LAMENT (Lazy Application, Modification, Editing and Notification Tool)
Some config files are cool
```toml
# $HOME/.config/starship.toml
command_timeout = 1500

[character]
success_symbol = "[>](bold green)"
error_symbol = "[x](bold red)"
vimcmd_symbol = "[<](bold green)"

[cmd_duration]
format = 'took [$duration](bold underline green)'
min_time = 0
```

Some config files are hot
```jsonc
// $HOME/.config/hyfetch.json
{
    "preset": "plural",
    "mode": "rgb",
    "light_dark": "dark",
    "lightness": 0.65,
    "color_align": {
        "mode": "horizontal",
        "custom_colors": [],
        "fore_back": null
    },
    "backend": "fastfetch",
    "args": null,
    "distro": null,
    "pride_month_shown": [],
    "pride_month_disable": false
}
```
Some config files are a torment to deal with
```bash
# /etc/default/grub
GRUB_DEFAULT=0
GRUB_TIMEOUT=0
GRUB_DISTRIBUTOR="Arch"
GRUB_CMDLINE_LINUX_DEFAULT="loglevel=3 rd.md.uuid=3efd81b6:30c9adec:2a39c662:5023b283"
GRUB_CMDLINE_LINUX=""

# Preload both GPT and MBR modules so that they are not missed
GRUB_PRELOAD_MODULES="part_gpt part_msdos"

# Uncomment to enable booting from LUKS encrypted devices
#GRUB_ENABLE_CRYPTODISK=y
```

But when it comes to edit a config file in a bash script, or in code in general, it's quite annoying to do. You have to use archaic patch, awk and sed scripts to properly achieve what you need. To append `modprobe.blacklist=nouveau` to the kernel args in the GRUB config I shared, you need to use this
```awk
#!/bin/env awk -f
# edit-kernel.awk
/^GRUB_CMDLINE_LINUX_DEFAULT/ {
    # Remove 'quiet splash' from the line
    gsub(/quiet splash/, "");
    # Append 'modprobe.blacklist=nouveau' if not already present
    if ($0 !~ /modprobe.blacklist=nouveau/) {
        $0 = $0 " modprobe.blacklist=nouveau"
    }
}
# do not touch the rest of the config file 
{ print }
```
and you have to run this manually
```bash
chmod +x ./edit-kernel.awk
./edit-kernel.awk <> /etc/default/grub
```

Now, if things go wrong, you need to roll back. So instead of doing it like this, you need to back the grub config up somewhere
```bash
cp /etc/default/grub /tmp/grub.conf.bak
./edit-kernel.awk <> /etc/default/grub
# if the command failed undo it
[[ $? == 0 ]] || cp /tmp/grub.conf.bak /etc/default/grub
```

Now imagine you have to apply the same config on a new machine, or on the post-install script of the proprietary NVIDIA drivers for our example. If you do a single thing wrong, nobody is going to warn you. Your entire system may collapse if you are editing fstab or something else that is critical. Nobody is going to warn you.

## How we solved this in production
Declarative and immutable systems for deployment of identical clusters exist, these include NixOS and Ansible. On NixOS, the example could be done by editing the `/etc/nixos/configuration.nix` like this
```nix
{ config, lib, pkgs, ... }:
{  
  boot.kernelParams = ["module_blacklist=nouveau"];
  ...
}
```

Okay, this is beautiful. But what would happen if you were to edit `/etc/default/grub`? Your system would have been doomed since you have broken immutability.
Puppet and Ansible do not offer anything better than our janky awk script either.
```yaml
# by the way did I mention how annoying YAML is
---
- name: Modify GRUB configuration
  hosts: all
  become: true
  tasks:
    - name: Remove 'quiet splash' from GRUB_CMDLINE_LINUX_DEFAULT
      lineinfile:
        path: /etc/default/grub
        regexp: '^GRUB_CMDLINE_LINUX_DEFAULT=.*quiet splash'
        line: "{{ lookup('file', '/etc/default/grub') | regex_replace('quiet splash', '') }}"
        backrefs: yes
        state: present

    - name: Append 'modprobe.blacklist=nouveau' if not present
      lineinfile:
        path: /etc/default/grub
        regexp: '^GRUB_CMDLINE_LINUX_DEFAULT'
        line: "{{ lookup('file', '/etc/default/grub') | regex_replace('modprobe.blacklist=nouveau', '') }} modprobe.blacklist=nouveau"
        backrefs: yes
        state: present

    - name: Update GRUB
      command: update-grub
```
```puppet
class grub_config {
  # Ensure 'quiet splash' is removed from GRUB_CMDLINE_LINUX_DEFAULT
  file_line { 'remove_quiet_splash':
    path  => '/etc/default/grub',
    match => '^GRUB_CMDLINE_LINUX_DEFAULT=',
    line  => regsubst(file('/etc/default/grub'), 'quiet splash', ''),
  }

  # Ensure 'modprobe.blacklist=nouveau' is added to GRUB_CMDLINE_LINUX_DEFAULT
  file_line { 'append_blacklist_nouveau':
    path  => '/etc/default/grub',
    match => '^GRUB_CMDLINE_LINUX_DEFAULT=',
    line  => regsubst(file('/etc/default/grub'), 'modprobe.blacklist=nouveau', '') . ' modprobe.blacklist=nouveau',
  }

  # Update GRUB after changes
  exec { 'update-grub':
    command => '/usr/sbin/update-grub',
    require => File_line['remove_quiet_splash', 'append_blacklist_nouveau'],
  }
}
```

we basically repeat the same stuff as our janky patches with AWK.
also these tools are not meant to edit config files, but rather *generate* them. They won't care about our pre-existing settings.  They will just override them.

## The Config Object Model
The config files are often loaded to data structures or objects at the startup of a program. GRUB won't be a good example because what it does is running shell scripts. So I need to continue from another program, and I choose to continue demonstrating on `pacman`
The `/etc/pacman.conf` file is loaded to this plain old C structure:
```c
typedef struct __config_t {
	unsigned short op;
	unsigned short quiet;
	unsigned short verbose;
	unsigned short version;
	unsigned short help;
	unsigned short noconfirm;
	unsigned short noprogressbar;
	unsigned short logmask;
	unsigned short print;
	unsigned short checkspace;
	unsigned short usesyslog;
	unsigned short color;
	unsigned short disable_dl_timeout;
	unsigned short disable_sandbox;
	char *print_format;
	/* unfortunately, we have to keep track of paths both here and in the library
	 * because they can come from both the command line or config file, and we
	 * need to ensure we get the order of preference right. */
	char *configfile;
	char *rootdir;
	char *dbpath;
	char *logfile;
	char *gpgdir;
	char *sysroot;
	char *sandboxuser;
	alpm_list_t *hookdirs;
	alpm_list_t *cachedirs;
	alpm_list_t *architectures;

	unsigned short op_q_isfile;
	unsigned short op_q_info;
	unsigned short op_q_list;
	unsigned short op_q_unrequired;
	unsigned short op_q_deps;
	unsigned short op_q_explicit;
	unsigned short op_q_owns;
	unsigned short op_q_search;
	unsigned short op_q_changelog;
	unsigned short op_q_upgrade;
	unsigned short op_q_check;
	unsigned short op_q_locality;

	unsigned short op_s_clean;
	unsigned short op_s_downloadonly;
	unsigned short op_s_info;
	unsigned short op_s_sync;
	unsigned short op_s_search;
	unsigned short op_s_upgrade;

	unsigned short op_f_regex;
	unsigned short op_f_machinereadable;

	unsigned short group;
	unsigned short noask;
	unsigned int ask;
	/* Bitfield of alpm_transflag_t */
	int flags;
	/* Bitfields of alpm_siglevel_t */
	int siglevel;
	int localfilesiglevel;
	int remotefilesiglevel;

	int siglevel_mask;
	int localfilesiglevel_mask;
	int remotefilesiglevel_mask;

	/* conf file options */
	/* I Love Candy! */
	unsigned short chomp;
	/* format target pkg lists as table */
	unsigned short verbosepkglists;
	/* number of parallel download streams */
	unsigned int parallel_downloads;
	/* select -Sc behavior */
	unsigned short cleanmethod;
	alpm_list_t *holdpkg;
	alpm_list_t *ignorepkg;
	alpm_list_t *ignoregrp;
	alpm_list_t *assumeinstalled;
	alpm_list_t *noupgrade;
	alpm_list_t *noextract;
	alpm_list_t *overwrite_files;
	char *xfercommand;
	char **xfercommand_argv;
	size_t xfercommand_argc;

	/* our connection to libalpm */
	alpm_handle_t *handle;

	alpm_list_t *explicit_adds;
	alpm_list_t *explicit_removes;

	/* Color strings for output */
	colstr_t colstr;

	alpm_list_t *repos;
} config_t;
```
[<small>(source)</small>](https://gitlab.archlinux.org/pacman/pacman/-/blob/master/src/pacman/conf.h?ref_type=heads#L47)

Don't be frightened by the huge data structure, half of it is often empty
It is often handy for a program to refer to its config in an object because it makes dealing with the values much easier. On startup, the config file is loaded with these lines of code:
```c
