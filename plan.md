chức năng reup content từ fanpage khác:
đầu tiên user sẽ nhập các linkfanpage khác vào textarea:
ví dụ:
https://www.facebook.com/DreamPCSetups
https://www.facebook.com/profile.php?id=61577182277706
https://www.facebook.com/profile.php?id=61565560251725
...
trong đó username là "DreamPCSetups", id là "61577182277706" và "61565560251725"
cần viết logic detect được username hoặc id từ link fanpage


sau đó bấm submit, flow diễn ra như sau:
chạy từng link -> từ link page -> lấy ra id page hoặc username page -> từ id page lấy ra danh sách videos
api lấy danh sách videos: ${id/username}/videos?fields=description,id,source,views,thumbnails{uri,is_preferred}&limit=100

trong đó description là text content của video, source là url mp4 video, views là số lượt view của video, thumbnails là array data link hình ảnh thumbnail của video

sau khi fetch videos của tất cả các pages thì render ra danh sách video gọn gàng cho user xem 2-3 ảnh thumbnail, xem lượt view, link video, bấm vào là sẽ mở video ngay trên app, vì data videos nhiều nên làm giao diện gọn gàng trực quan, có thêm chức năng chọn từng video, hoặc chọn tất cả videos.

sau khi chọn video xong thì đến bước 2 là chọn page của user. trong context fanpage thì chúng ta cần lấy danh sách page của mình ra để pick chọn những page để đăng video lên, cho chọn nhiều hoặc chọn tất cả, có search theo tên page hoặc id page. 

sau khi search xong thì chúng ta sẽ chuyển đến form chọn khung giờ đăng bài trong ngày. user sẽ nhập các khung giờ trong ngày ví dụ như:
"7:00", "12:00","15:00","20:00",... (số lượng khung giờ tuỳ chọn, lặp đi lặp lại trong ngày dựa theo số lượng videos đã pick chọn để sắp xếp thời gian đăng bài)

chúng ta cần 1 hàm để đăng video lên facebook fanpage, hàm này sẽ cần đăng video và kèm theo thông số hẹn giờ như là: published=false và scheduled_publish_time là thời gian hẹn giờ public bài video
Tham số cần có
Param	Bắt buộc	Mô tả
file_url hoặc source	✅	link video hoặc upload file
description	❌	caption
published	✅	phải = false
scheduled_publish_time	✅	thời gian hẹn
access_token	✅	page token

curl -X POST "https://graph.facebook.com/v21.0/{page_id}/videos" \
  -d "file_url=https://example.com/video.mp4" \
  -d "description=Video hẹn giờ" \
  -d "published=false" \
  -d "scheduled_publish_time=1712000000" \
  -d "access_token=YOUR_PAGE_ACCESS_TOKEN"
  kèm theo headers cookie vào request nữa

  tiếp theo user sẽ bấm setup content reup thì app sẽ tính toán phần bổ videos theo thời gian cho các fanpage và gửi request đăng bài ở trạng thái hẹn giờ cho các fanpage.


đến với chức năng cài đặt, chúng ta cần thêm 1 danh mục cài đặt đó là prompt content, user sẽ cấu hình prompt rewrite content dựa vào content gốc. sau khi có prompt content này rồi thì chúng ta sẽ có 1 hàm rewritecontent. hàm này sẽ viết content mới dựa theo content gốc và được hướng dẫn bởi prompt content mà user cài đặt.

