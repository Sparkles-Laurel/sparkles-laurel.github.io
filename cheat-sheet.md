# Örnek Test Kopya Kâğıdı

## Yaygın kullanılan Assembly talimatları

- `MOV {reg}, {reg/mem}`: `{reg}` veya `{mem}` operandındaki veriyi {reg} sayıcısına aktarır.
- `PUSH {reg}`: `{reg}`deki değeri stack bölgesinin en tepesine atar.
- `POP {reg}`: Stack bölgesinin tepesindeki değeri çıkarır ve `{reg}`e yükler.
- `ADD {reg}, {reg/mem}`: `{reg}` operandının değerine `{reg/mem}` kadar ekler.
- `SUB {reg}, {reg/mem}`: `ADD` gibidir, ancak `{reg}`in değerini azaltır.
- `SHL {reg}, [1 | CL]`: `{reg}` operandındaki değerin bitlerini, 1 kere veya `CL` sayıcısındaki değer kadar sola kaydırır. Boşta kalan bitler 0 ile doldurulur.
- `SHR {reg}, [1 | CL]`: `SHL` gibidir, ancak değeri sola değil sağa kaydırır. Solda boşta kalan bitler 0 ile doldurulur.
- `CALL {addr}`: Programın akışını `{addr}` ile belirtilen adrese yönlendirir. `CS` ve `IP` sayıcılarının değeri korunur, `F` sayıcısınınki korunmaz.
- `INT {intid}`: Bir BIOS kesmesini çalıştırır. Bu kesmeler donanımın kontrolünü sağlar. `CS`, `IP` ve `F` sayıcılarının değeri korunur.
- `CL {reg}, [1 | CL]`: `{reg}` sayıcısının değerini 1 ile veya `CL` sayıcısındaki değer ile çarpar.
- `DIV {reg}, {reg/mem}`: `ADD` ve `SUB` komutları gibidir, ancak bölme işlemi yapar.

## HTTP durum kodları
- 100: Continue
- 101: Switching Protocols
- 102: Processing
*diğer 100 sınıfı (bilgi) kodları çok nadir kullanılır.*

- 200: OK
- 201: Created
- 202: Accepted
- 203: Non-Authorative Information
- 204: No Content
- 205: Reset Content
- 206: Partial Content


*200 sınıfı kodlar işlemin başarı ile tamamlandığını belirtir.*

- 300: Multiple Choices
- 301: Moved Permanently
- 302: Found
- 303: See Other
- 304: Not Modified
- 307: Temporary Redirect
- 308: Permanent Redirect

*300 sınıfı kodlar, yönlendirme (redirection) için kullanılır. İstemcinin aradığı bilginin yerinde olmadığını ve nereye gitmesi gerektiğini bildirir.*

- 400: Bad Request
- 401: Unauthorized
- 402: Payment Required (Ödeme API Spesifikasyonu için rezerve edilmiştir.)
- 403: Forbidden
- 404: Not Found
- 405: Method Not Allowed
- 406: Not Acceptable
- 407: Proxy Authentication Required
- 408: Request Timeout
- 409: Conflict
- 410: Gone
- 411: Length Required
- 412: Precondition Failed
- 413: Payload Too Long
- 414: URI Too Long
- 415: Unsupported Media Type
- 416: Range Not Satisfiable
- 417: Expectation Failed
- 418: I'm a Teapot (1 Nisan şakası, hâlen sunucuların "yapmak istemedikleri" işler için kullanılır.)
- 429: Too Many Requests (sunucuya DoS atmaktan banlandınız)

*400 sınıfı kodlar, istemciden kaynaklı bir hata olduğunu belirtir.*

- 500: Internal Server Error
- 501: Not Implemented
- 502: Bad Gateway
- 503: Service Unavailable (tebrikler, sunucuyu çökertmeyi başardınız)
