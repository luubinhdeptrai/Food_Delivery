**Mô hình Usecase Quản lý Khách sạn**

Version 1.0

Sinh viên thực hiện:

23520156 – Lưu Bình

23520242 – Nguyễn Đại Trường Danh

21521338 - Lê Đăng Quang

23520573 - Phạm Hùng

23520456 - Điều Xuân Hiển

**Bảng ghi nhận thay đổi tài liệu**

| **Ngày** | **Phiên bản** | **Mô tả** | **Tác giả** |
| --- | --- | --- | --- |
| 07/10/2025 | 1.0 | Hoàn thành bản đầu tiên của tài liệu Use Case — bao gồm danh sách tác nhân, mô tả chi tiết các ca sử dụng chính, luồng sự kiện chính và luồng thay thế… | Nhóm 8 |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

**Mục lục**

[**1. Sơ đồ Use-case 2**](#_heading=h.mje16ir42lwf)

[1.1 Use-case Quản lý phòng 3](#_heading=h.mwrsk6chjrdq)

[1.2 Use-case Quản lý loại phòng 4](#_heading=h.ephkjufu1myy)

[1.3. Use-case Đặt phòng 5](#_heading=h.z66q92ks1m26)

[1.4. Use-case Check-in nhận phòng 6](#_heading=h.6pea037cmhh9)

[1.5 Use-case checkout trả phòng 7](#_heading=h.l0zepi7hz8c1)

[1.6 Use-case quản lý dịch vụ 8](#_heading=h.yv1ezy5qtcpl)

[1.7 Use-case quản lý nhân viên và phân quyền 9](#_heading=h.grdacjn1errx)

[1.8 Use-case quản lý thanh toán và hóa đơn 10](#_heading=h.5xyozf6aodfl)

**2. Danh sách các Actor 11**

**3. Danh sách các Use-case 11**

**4. Đặc tả Use-case 11**

[4.1 Quản lý phòng 11](#_heading=h.mn9bt5lhp5p6)

[4.2 Quản lý loại phòng 13](#_heading=h.jesr4fe7bo0w)

[4.3. Đặt phòng 16](#_heading=h.rjyuaq8ogzw7)

[4.4. Check-in nhận phòng 18](#_heading=h.vpcrbdd6ua53)

[4.5 Check-out trả phòng 20](#_heading=h.v6x57tvj2gtj)

[4.6. Quản lý dịch vụ 22](#_heading=h.w659hbdeuz5g)

[4.7 Quản lý nhân viên và phân quyền 25](#_heading=h.qldvpxudjkkr)

[4.8 Quản lý Thanh toán và Hóa đơn 28](#_heading=h.g797l5g0dpbe)

# **Sơ đồ Use-case**

## 1.1 Use-case Quản lý phòng

![](data:image/png;base64...)

## 1.2 Use-case Quản lý loại phòng

![](data:image/png;base64...)

## 1.3. Use-case Đặt phòng

![](data:image/png;base64...)

## 1.4. Use-case Check-in nhận phòng

![](data:image/png;base64...)

##

## 1.5 Use-case checkout trả phòng

![](data:image/png;base64...)

## 1.6 Use-case quản lý dịch vụ

![](data:image/png;base64...)

## 1.7 Use-case quản lý nhân viên và phân quyền

![](data:image/png;base64...)

## 1.8 Use-case quản lý thanh toán và hóa đơn![](data:image/png;base64...)

# **Danh sách các Actor**

| STT | Tên Actor | Ý nghĩa/Ghi chú |
| --- | --- | --- |
| 1 | Khách hàng | Tương tác với hệ thống để thực hiện các yêu cầu mang tính quy trình (cung cấp thông tin, thanh toán) và thực hiện mục đích cá nhân. |
| 2 | Lễ tân | Tương tác với hệ thống để thực hiện các yêu cầu nghiệp vụ. |
| 3 | Quản lý (Admin/Manager) | Tương tác với hệ thống để thực hiện các yêu cầu quản lý, có thể xử lý những trường hợp ngoại lệ và can thiệp vào nghiệp vụ của khách sạn. |
| 4 | Nhân viên (có thể bao gồm nhiều chức vụ: Dọn phòng, bảo trì..) | Tương tác với hệ thống để thực hiện các yêu cầu nghiệp vụ. |

# **Danh sách các Use-case**

| STT | Tên Use-case | Ý nghĩa/Ghi chú |
| --- | --- | --- |
| 1 | Quản lý phòng | Cho phép Lễ tân quản lý thông tin phòng trong hệ thống bao gồm: thêm phòng mới, cập nhật thông tin phòng, thay đổi trạng thái phòng (trống, đang sử dụng, bảo trì) và xóa phòng khi cần thiết. |
| 2 | Quản lý loại phòng | Cho phép Lễ tân quản lý danh sách loại phòng của khách sạn, bao gồm việc thêm mới, chỉnh sửa, xóa hoặc cập nhật thông tin loại phòng (tên loại, giá cơ bản, sức chứa, mô tả, tiện nghi mặc định, v.v.). |
| 3 | Đặt phòng | Cho phép **khách hàng hoặc lễ tân** tạo một **đặt phòng mới**, bao gồm chọn phòng trống, nhập thông tin khách, tính tổng tiền và xác nhận đặt. |
| 4 | Check-in nhận phòng | Mô tả quy trình **lễ tân xác minh đặt phòng và thực hiện nhận phòng**, bao gồm kiểm tra thông tin khách, cập nhật trạng thái đặt/phòng và giao chìa khóa. |

# **Đặc tả Use-case**

## 4.1 Quản lý phòng

| Use Case ID: | UC1 |
| --- | --- |
| Tên Use Case: | Quản lý phòng |
| Người tạo: | Lê Đăng Quang |
| Người cập nhật cuối: |  |
| Ngày tạo: | 07/10/2025 |
| Ngày cập nhật: |  |
| Actor | Lễ tân (Receptionist) |
| Mô tả (Description) | Use case cho phép Lễ tân quản lý thông tin phòng trong hệ thống bao gồm: thêm phòng mới, cập nhật thông tin phòng, thay đổi trạng thái phòng (trống, đang sử dụng, bảo trì) và xóa phòng khi cần thiết. |
| Điều kiện tiên quyết (Preconditions) | Lễ tân đã đăng nhập vào hệ thống.  Hệ thống đã kết nối với cơ sở dữ liệu phòng. |
| Kết quả sau cùng (Postconditions) | Thông tin phòng được thêm, cập nhật hoặc xóa thành công trong hệ thống.  Trạng thái phòng được đồng bộ và hiển thị chính xác trong danh sách phòng. |
| Mức độ ưu tiên (Priority) |  |
| Tần suất sử dụng (Frequency of Use): | Hàng ngày |
| Luồng sự kiện chính (Normal Course of Events) | 1. Lễ tân truy cập vào chức năng “Quản lý phòng”. 2. Hệ thống hiển thị danh sách tất cả các phòng hiện có. 3. Lễ tân chọn thao tác: Thêm mới / Chỉnh sửa / Xóa / Cập nhật trạng thái. 4. Hệ thống hiển thị form tương ứng với thao tác được chọn. 5. Lễ tân nhập hoặc chỉnh sửa thông tin phòng (mã phòng, loại phòng, giá, tình trạng, mô tả, tiện nghi,...). 6. Hệ thống kiểm tra tính hợp lệ của dữ liệu nhập. 7. Hệ thống lưu thông tin vào cơ sở dữ liệu. 8. Hệ thống thông báo thành công và cập nhật lại danh sách phòng. |
| Luồng thay thế (Alternative Courses) | Nếu lễ tân chọn Xóa phòng, hệ thống yêu cầu xác nhận trước khi thực hiện. |
| Ngoại lệ (Exceptions) | Dữ liệu nhập không hợp lệ → hiển thị thông báo lỗi.  Lỗi kết nối cơ sở dữ liệu → hiển thị “Không thể lưu thay đổi, vui lòng thử lại sau.”  Dữ liệu phòng không hợp lệ -> hiển thị field đó bị lỗi |
| Bao gồm (Includes) | Kiểm tra dữ liệu phòng (Validate Room Data)  Cập nhật trạng thái phòng (Update Room Status)  Đồng bộ với hệ thống đặt phòng (Sync with Booking System) |
| Mở rộng (Extends) | Gắn hình ảnh phòng (Attach Room Images)  Xuất danh sách phòng (Export Room List) |
| Yêu cầu đặc biệt (Special Requirements) | Hệ thống hỗ trợ tải ảnh phòng định dạng JPEG hoặc PNG, tối đa 5MB mỗi ảnh.  Mọi thay đổi thông tin phòng phải ghi lại lịch sử chỉnh sửa (audit log).  Thời gian xử lý lưu hoặc cập nhật thông tin phòng ≤ 3 giây. |
| Giả định (Assumptions) | Dữ liệu phòng và đặt phòng luôn được đồng bộ hai chiều.  Lễ tân có quyền truy cập hợp lệ trong hệ thống. |
| Ghi chú & Vấn đề (Notes and Issues) | Khi phòng chuyển sang trạng thái “Bảo trì”, hệ thống cần kiểm tra để tránh trùng lịch với các đặt phòng sẵn có.  Cần thông báo rõ ràng cho lễ tân khi thao tác bị giới hạn do quyền truy cập. |

## 4.2 Quản lý loại phòng

| Use Case ID: | UC2 |
| --- | --- |
| Tên Use Case: | Quản lý loại phòng |
| Người tạo: | Lê Đăng Quang |
| Người cập nhật cuối: |  |
| Ngày tạo: | 07/10/2025 |
| Ngày cập nhật: |  |
| Actor | Lễ tân (Receptionist) |
| Mô tả (Description) | Use case cho phép Lễ tân quản lý danh sách loại phòng của khách sạn, bao gồm việc thêm mới, chỉnh sửa, xóa hoặc cập nhật thông tin loại phòng (tên loại, giá cơ bản, sức chứa, mô tả, tiện nghi mặc định, v.v.).  Chức năng này giúp đảm bảo dữ liệu loại phòng luôn chính xác và nhất quán với hệ thống đặt phòng. |
| Điều kiện tiên quyết (Preconditions) | Lễ tân đã đăng nhập vào hệ thống.  Hệ thống đã kết nối với cơ sở dữ liệu loại phòng. |
| Kết quả sau cùng (Postconditions) | Thông tin loại phòng được thêm, cập nhật hoặc xóa thành công.  Các thay đổi được đồng bộ với danh sách phòng và hệ thống đặt phòng. |
| Mức độ ưu tiên (Priority) | Trung bình – Cao |
| Tần suất sử dụng (Frequency of Use) | Thỉnh thoảng (khi khách sạn có thay đổi danh mục phòng hoặc giá cơ bản) |
| Luồng sự kiện chính (Normal Course of Events) | 1. Lễ tân truy cập vào chức năng “Quản lý loại phòng”. 2. Hệ thống hiển thị danh sách các loại phòng hiện có. 3. Lễ tân chọn thao tác: **Thêm mới / Chỉnh sửa / Xóa**. 4. Hệ thống hiển thị form tương ứng với thao tác. Lễ tân nhập hoặc chỉnh sửa thông tin loại phòng (tên loại, giá cơ bản, sức chứa, tiện nghi mặc định, mô tả, hình ảnh minh họa,...). Hệ thống kiểm tra tính hợp lệ của dữ liệu. 5. Hệ thống lưu thông tin loại phòng vào cơ sở dữ liệu. Hệ thống hiển thị thông báo thành công và cập nhật lại danh sách loại phòng. |
| Luồng thay thế (Alternative Courses) | Nếu lễ tân chọn **Xóa loại phòng**, hệ thống yêu cầu xác nhận trước khi thực hiện.  Nếu loại phòng đang được sử dụng bởi phòng hiện tại, hệ thống không cho phép xóa mà chỉ cho phép chỉnh sửa thông tin. |
| Ngoại lệ (Exceptions) | Dữ liệu nhập không hợp lệ → hiển thị thông báo lỗi.  Lỗi kết nối cơ sở dữ liệu → hiển thị “Không thể lưu thay đổi, vui lòng thử lại sau.”  Lễ tân không có quyền thao tác cụ thể → hiển thị cảnh báo “Truy cập bị từ chối.” |
| Bao gồm (Includes) | Kiểm tra dữ liệu loại phòng (Validate Room Type Data)  Cập nhật danh sách phòng theo loại (Update Room List by Type) Đồng bộ với hệ thống đặt phòng (Sync with Booking System) |
| Mở rộng (Extends) | Gắn hình ảnh minh họa loại phòng (Attach Room Type Images)  Cập nhật tiện nghi mặc định (Edit Default Amenities)  Xuất danh sách loại phòng (Export Room Type List) |
| Yêu cầu đặc biệt (Special Requirements) | Hệ thống hỗ trợ định dạng ảnh JPEG/PNG tối đa 5MB cho mỗi loại phòng.  Mọi thay đổi giá cơ bản phải ghi lại lịch sử cập nhật. Thời gian phản hồi khi lưu hoặc cập nhật ≤ 3 giây. |
| Giả định (Assumptions) | Dữ liệu loại phòng và dữ liệu phòng luôn được đồng bộ.  Lễ tân có quyền truy cập hợp lệ trong module quản lý phòng. |
| Ghi chú & Vấn đề (Notes and Issues) | Nếu loại phòng bị thay đổi giá, hệ thống cần cảnh báo cho các đặt phòng chưa xác nhận để cập nhật chi phí tương ứng.  Cần đảm bảo danh sách loại phòng hiển thị đúng trên giao diện đặt phòng của khách hàng. |

## 4.3. Đặt phòng

| Use Case ID: | UC3 |
| --- | --- |
| Tên Use Case: | Tạo Đặt Phòng (Create Booking) |
| Người tạo: | Lưu Bình |
| Người cập nhật cuối: |  |
| Ngày tạo: | 07/10/2025 |
| Ngày cập nhật: |  |

| Tác nhân (Actor): | - Khách hàng (Customer) - Lễ tân (Receptionist) |
| --- | --- |
| Mô tả (Description): | Use case cho phép Khách hàng hoặc Lễ tân tạo một đặt phòng mới bằng cách chọn phòng trống, nhập thông tin khách hàng và xác nhận đặt phòng. |
| Điều kiện tiên quyết (Preconditions): | - Hệ thống đã kết nối với cơ sở dữ liệu phòng. - Người dùng đã xác thực hoặc được lễ tân hỗ trợ. |
| Kết quả sau cùng (Postconditions): | - Một bản ghi đặt phòng mới được tạo trong hệ thống. - Email/SMS xác nhận được gửi đến khách hàng. |
| Mức độ ưu tiên (Priority): | Cao |
| Tần suất sử dụng (Frequency of Use): | Hàng ngày |
| Luồng sự kiện chính (Normal Course of Events): | 1. Khách hàng tìm phòng trống. 2. Hệ thống kiểm tra phòng trống. 3. Khách hàng chọn phòng và nhập thông tin đặt phòng. 4. Hệ thống kiểm tra dữ liệu đặt phòng. 5. Hệ thống tính tổng tiền. 6. Khách hàng chọn phương thức thanh toán. 7. Hệ thống tạo bản ghi đặt phòng. 8. Hệ thống gửi email và SMS xác nhận. |
| Luồng thay thế (Alternative Courses): | - Nếu chưa thanh toán, hệ thống giữ trạng thái 'Chờ xử lý'. |
| Ngoại lệ (Exceptions): | - Phòng bị hết trước khi xác nhận → hiển thị thông báo lỗi. - Dữ liệu nhập không hợp lệ → hiển thị lỗi xác minh. |
| Bao gồm (Includes): | - Kiểm tra dữ liệu đặt phòng (Validate Booking Data) - Kiểm tra phòng trống (Check Room Availability) - Tính tổng tiền (Calculate Total Price) - Chọn hình thức thanh toán (Select Payment Method) |
| Mở rộng (Extends): | - Đặt cọc (Pay Deposit) - Gửi email xác nhận (Send Confirmation Email) - Gửi thông báo SMS (Send SMS Notification) |
| Yêu cầu đặc biệt (Special Requirements): | - Hệ thống hỗ trợ nhiều hình thức thanh toán (tiền mặt, thẻ, online). - Thông báo phải được gửi trong vòng 5 giây sau khi xác nhận đặt phòng. |
| Giả định (Assumptions): | - Kết nối Internet ổn định. - Cổng thanh toán hoạt động bình thường. |
| Ghi chú & Vấn đề (Notes and Issues): | - Dữ liệu đặt phòng cần được đồng bộ với hệ thống quản lý khách sạn. |
|  |  |

## 4.4. Check-in nhận phòng

| Use Case ID: | UC4 |
| --- | --- |
| Tên Use Case: | Nhận Phòng (Check-in) |
| Người tạo: | Lưu Bình |
| Người cập nhật cuối: |  |
| Ngày tạo: | 07/10/2025 |
| Ngày cập nhật: |  |

| Tác nhân (Actor): | - Lễ tân (Receptionist) - Khách hàng (Customer) |
| --- | --- |
| Mô tả (Description): | Use case mô tả quy trình lễ tân thực hiện việc nhận phòng cho khách, bao gồm kiểm tra đặt phòng, xác minh thông tin khách, tạo phiếu thuê, cập nhật trạng thái đặt/phòng và giao chìa khóa phòng. |
| Điều kiện tiên quyết (Preconditions): | - Hệ thống đã có dữ liệu đặt phòng. - Khách đã đến quầy lễ tân và cung cấp thông tin nhận dạng hợp lệ. |
| Kết quả sau cùng (Postconditions): | - Phiếu thuê được tạo thành công. - Trạng thái đặt phòng và phòng được cập nhật sang 'Đã nhận'. - Khách nhận chìa khóa phòng và có thể vào phòng. |
| Mức độ ưu tiên (Priority): | Cao |
| Tần suất sử dụng (Frequency of Use): | Hàng ngày |
| Luồng sự kiện chính (Normal Course of Events): | 1. Lễ tân tìm đặt phòng theo tên hoặc mã đặt. 2. Hệ thống kiểm tra thông tin đặt và dữ liệu khách hàng. 3. Lễ tân xác minh danh tính khách. 4. Hệ thống xác nhận thông tin hợp lệ. 5. Lễ tân tạo phiếu thuê phòng. 6. Hệ thống tự động cập nhật trạng thái đặt và trạng thái phòng. 7. Hệ thống tính tiền phòng và phụ thu (nếu có). 8. Lễ tân giao chìa khóa hoặc thẻ phòng cho khách. 9. Hệ thống gửi thông báo xác nhận nhận phòng. |
| Luồng thay thế (Alternative Courses): | - Nếu khách chưa đặt phòng, lễ tân có thể thực hiện 'Tạo đặt phòng trực tiếp (Walk-in Booking)'. - Nếu phòng chưa sẵn sàng, thông báo khách chờ hoặc đổi phòng khác. |
| Ngoại lệ (Exceptions): | - Không tìm thấy đặt phòng phù hợp → hiển thị thông báo lỗi. - Dữ liệu khách không hợp lệ → yêu cầu nhập lại. - Phòng đã bị trùng hoặc lỗi hệ thống → liên hệ quản lý. |
| Bao gồm (Includes): | - Cập nhật trạng thái đặt (Update Booking Status) - Cập nhật trạng thái phòng (Update Room Status) - Tính tiền phòng (Calculate Room Charges) |
| Mở rộng (Extends): | - Giao chìa khóa phòng (Assign Room Key) - Gửi thông báo (Send Notification) - Tạo đặt phòng trực tiếp (Create Walk-in Booking) |
| Yêu cầu đặc biệt (Special Requirements): | - Hệ thống cập nhật trạng thái phòng theo thời gian thực. - Phiếu thuê phải được in hoặc lưu file PDF. - Dữ liệu nhận phòng phải đồng bộ với hệ thống kế toán. |
| Giả định (Assumptions): | - Cơ sở dữ liệu phòng hoạt động bình thường. - Kết nối mạng ổn định. |
| Ghi chú & Vấn đề (Notes and Issues): | - Lễ tân cần có quyền truy cập vào chức năng quản lý phòng. - Có thể cần kiểm tra thông tin khách cũ để tái sử dụng hồ sơ. |
|  |  |

## 4.5 Check-out trả phòng

| Use Case ID: | UC5 |
| --- | --- |
| Tên Use Case: | Trả Phòng (Check-out) |
| Người tạo: | Điều Xuân |
| Người cập nhật cuối: |  |
| Ngày tạo: | 7/10/2025 |
| Ngày cập nhật: |  |

| Tác nhân (Actor): | - Lễ tân (Receptionist) - Nhân viên dọn phòng (Housekeeping Staff) |
| --- | --- |
| Mô tả (Description): | Use case mô tả quy trình lễ tân thực hiện việc trả phòng cho khách, bao gồm kiểm tra dịch vụ phát sinh, phụ thu, phạt, tính tổng tiền, xử lý thanh toán, kiểm tra tình trạng phòng và cập nhật trạng thái phòng. |
| Điều kiện tiên quyết (Preconditions): | - Hệ thống đã có dữ liệu phiếu thuê phòng hợp lệ. - Khách đã hoàn tất thời gian lưu trú và đến quầy lễ tân để trả phòng. - Phòng đang ở trạng thái "Đang sử dụng". |
| Kết quả sau cùng (Postconditions): | - Phiếu trả phòng được tạo thành công. - Thanh toán được xử lý hoàn tất. - Trạng thái phòng được cập nhật sang "Đang vệ sinh" hoặc "Trống". - Nhân viên dọn phòng nhận được thông báo. |
| Mức độ ưu tiên (Priority): | Cao |
| Tần suất sử dụng (Frequency of Use): | Hàng ngày |
| Luồng sự kiện chính (Normal Course of Events): | 1. Lễ tân chọn phiếu thuê phòng theo mã phiếu thuê. 2. Hệ thống hiển thị thông tin phiếu thuê và khách hàng. 3. Lễ tân kiểm tra các dịch vụ phát sinh đã sử dụng. 4. Hệ thống tính toán phí dịch vụ. 5. Lễ tân kiểm tra các khoản phụ thu (nếu có). 6. Hệ thống tính toán phụ thu. 7. Lễ tân kiểm tra các khoản phạt (nếu có). 8. Hệ thống tính toán phí phạt. 9. Hệ thống tính tổng tiền (tiền phòng + dịch vụ + phụ thu + phạt). 10. Lễ tân tạo phiếu trả phòng. 11. Hệ thống xác nhận dữ liệu hợp lệ. 12. Lễ tân kiểm tra tình trạng phòng (kiểm kê). 13. Nếu có hư hỏng, lễ tân ghi nhận vào hệ thống. 14. Lễ tân xử lý thanh toán. 15. Hệ thống in hóa đơn cho khách. 16. Lễ tân đánh dấu phòng sang trạng thái "Đang vệ sinh". 17. Hệ thống gửi thông báo cho nhân viên dọn phòng. 18. Nhân viên dọn phòng nhận thông báo và tiến hành vệ sinh. 19. Sau khi hoàn tất, nhân viên đánh dấu phòng sang "Trống". 20. Hệ thống gửi thông báo xác nhận trả phòng. |
| Luồng thay thế (Alternative Courses): | - Nếu khách trả phòng muộn, hệ thống tính thêm phí phạt trả phòng muộn. - Nếu thanh toán thất bại, yêu cầu khách chọn phương thức thanh toán khác. - Nếu phòng có hư hỏng nghiêm trọng, báo cáo cho quản lý trước khi hoàn tất check-out. |
| Ngoại lệ (Exceptions): | - Không tìm thấy phiếu thuê phòng → hiển thị thông báo lỗi. - Dữ liệu thanh toán không hợp lệ → yêu cầu nhập lại. - Lỗi hệ thống khi tạo phiếu trả phòng → liên hệ quản lý. - Thanh toán bị từ chối → thông báo và yêu cầu phương thức khác. |
| Bao gồm (Includes): | - Kiểm tra dữ liệu (Validate Data) - Tính toán phí (Calculate Charges) |
| Mở rộng (Extends): | - Kiểm tra tình trạng phòng (Inspect Room Condition) - Ghi nhận hư hỏng (Record Damage) - Xử lý thanh toán (Process Payment) - In hóa đơn (Print Invoice) - Đánh dấu đang vệ sinh (Mark as Cleaning) - Đánh dấu trống (Mark as Available) - Thông báo nhân viên dọn phòng (Notify Housekeeping) - Gửi thông báo (Send Notification) |
| Yêu cầu đặc biệt (Special Requirements): | - Hệ thống cập nhật trạng thái phòng theo thời gian thực. - Hóa đơn phải được in hoặc lưu file PDF và gửi email cho khách (nếu yêu cầu). - Dữ liệu trả phòng phải đồng bộ với hệ thống kế toán. - Phải ghi log tất cả các giao dịch thanh toán. |
| Giả định (Assumptions): | - Cơ sở dữ liệu phòng và phiếu thuê hoạt động bình thường. - Kết nối mạng nội bộ ổn định - Thiết bị thanh toán điện tử hoạt động tốt. |

## 4.6. Quản lý dịch vụ

| Use Case ID: | UC6 |
| --- | --- |
| Tên Use Case: | Quản lý Dịch vụ (Service Management) |
| Người tạo: | Điều Xuân Hiển |
| Người cập nhật cuối: |  |
| Ngày tạo: | 7/10/2025 |
| Ngày cập nhật: |  |

| Tác nhân (Actor): | - Quản lý (Manager) - Lễ tân (Receptionist) - Nhân viên phục vụ (Service Staff) |
| --- | --- |
| Mô tả (Description): | Use case mô tả quy trình quản lý toàn diện các dịch vụ trong khách sạn, bao gồm quản lý loại dịch vụ, quản lý dịch vụ cụ thể, xử lý yêu cầu dịch vụ từ phòng, ghi nhận nhân viên phục vụ, và tích hợp với hệ thống hóa đơn. |
| Điều kiện tiên quyết (Preconditions): | - Hệ thống đã có dữ liệu phòng và phiếu thuê phòng. - Người dùng đã đăng nhập với quyền phù hợp. - Danh mục loại dịch vụ đã được thiết lập (cho thao tác thêm dịch vụ). |
| Kết quả sau cùng (Postconditions): | - Dữ liệu dịch vụ/loại dịch vụ được cập nhật trong hệ thống. - Yêu cầu dịch vụ được ghi nhận và liên kết với phòng. - Hóa đơn phòng được cập nhật với chi phí dịch vụ. - Lịch sử dịch vụ được lưu trữ đầy đủ. |
| Mức độ ưu tiên (Priority): | Cao |
| Tần suất sử dụng (Frequency of Use): | Hàng ngày |
| Luồng sự kiện chính (Normal Course of Events): | **A. Quản lý Loại dịch vụ (Manager):**  1. Quản lý chọn chức năng quản lý loại dịch vụ.  2. Hệ thống hiển thị danh sách loại dịch vụ hiện có.  3. Quản lý chọn thêm/sửa/xóa loại dịch vụ. 4. Hệ thống kiểm tra dữ liệu đầu vào.  5. Hệ thống lưu thay đổi và hiển thị thông báo thành công.  **B. Quản lý Dịch vụ (Manager):**  6. Quản lý chọn chức năng quản lý dịch vụ. 7. Hệ thống hiển thị danh sách dịch vụ theo loại.  8. Quản lý chọn thêm/sửa/xóa dịch vụ hoặc thiết lập giá.  9. Hệ thống kiểm tra dữ liệu và lưu thay đổi. **C. Thêm Dịch vụ cho Phòng (Receptionist/Service Staff):**  10. Người dùng chọn phòng và chức năng thêm dịch vụ.  11. Hệ thống hiển thị danh sách dịch vụ có sẵn.  12. Người dùng chọn dịch vụ và nhập số lượng.  13. Hệ thống kiểm tra dữ liệu đầu vào.  14. Nhân viên phục vụ ghi nhận thông tin phục vụ (nếu có).  15. Hệ thống tính chi phí dịch vụ.  16. Hệ thống cập nhật hóa đơn phòng.  17. Hệ thống liên kết dịch vụ với hóa đơn. 18. Hệ thống lưu lịch sử dịch vụ.  19. Hệ thống hiển thị xác nhận thành công. **D. Xem Lịch sử Dịch vụ:**  20. Người dùng chọn phòng và xem lịch sử dịch vụ.  21. Hệ thống hiển thị chi tiết các dịch vụ đã sử dụng. |
| Luồng thay thế (Alternative Courses): | - **A3a**: Nếu xóa loại dịch vụ đang được sử dụng → hiển thị cảnh báo và yêu cầu xác nhận.  - **B8a**: Nếu xóa dịch vụ đang có trong hóa đơn → hiển thị cảnh báo và không cho phép xóa.  - **C12a**: Nếu dịch vụ hết hàng/không khả dụng → hiển thị thông báo và đề xuất dịch vụ thay thế.  - **C12b**: Nếu cập nhật số lượng → tính lại chi phí và cập nhật hóa đơn. |
| Ngoại lệ (Exceptions): | - Dữ liệu đầu vào không hợp lệ → hiển thị thông báo lỗi cụ thể. - Không tìm thấy phòng/phiếu thuê → hiển thị thông báo lỗi.  - Lỗi khi cập nhật hóa đơn → rollback thao tác và thông báo. - Không có quyền truy cập → hiển thị thông báo từ chối. - Loại dịch vụ không tồn tại khi thêm dịch vụ → yêu cầu tạo loại dịch vụ trước. |
| Bao gồm (Includes): | - Kiểm tra dữ liệu (Validate Data)  - Cập nhật hóa đơn phòng (Update Room Invoice)  - Tính chi phí dịch vụ (Calculate Service Cost) |
| Mở rộng (Extends): | - Ghi nhận nhân viên phục vụ (Record Service Staff)  - Liên kết dịch vụ với hóa đơn (Link Service to Invoice) |
| Yêu cầu đặc biệt (Special Requirements): | - Hệ thống phải hỗ trợ nhiều loại dịch vụ (ăn uống, giặt ủi, spa, minibar, v.v.).  - Giá dịch vụ có thể thay đổi theo thời gian, cần lưu lịch sử giá.  - Hỗ trợ tính toán tự động chi phí khi thay đổi số lượng.  - Phân quyền rõ ràng: chỉ Manager mới có quyền quản lý loại dịch vụ và giá.  - Ghi log tất cả thao tác thêm/sửa/xóa dịch vụ.  - Tích hợp với hệ thống kế toán để theo dõi doanh thu từ dịch vụ. |
| Giả định (Assumptions): | - Cơ sở dữ liệu dịch vụ hoạt động bình thường. - Kết nối mạng ổn định. - Người dùng đã được đào tạo về quy trình quản lý dịch vụ. - Giá dịch vụ đã được thiết lập trước khi sử dụng. |
| Ghi chú & Vấn đề (Notes and Issues): | - Cần có cơ chế kiểm soát tồn kho cho các dịch vụ có hàng hóa vật lý (minibar, đồ giặt). - Xem xét tích hợp với hệ thống POS (Point of Sale) cho dịch vụ ăn uống. - Cần báo cáo thống kê dịch vụ được sử dụng nhiều nhất.  - Hỗ trợ gói dịch vụ (bundle services) với giá ưu đãi.  - Cần có chính sách xử lý khi khách phàn nàn về chất lượng dịch vụ. |

## 4.7 Quản lý nhân viên và phân quyền

| Use Case ID: | UC7 |
| --- | --- |
| Tên Use Case: | Quản lý nhân viên và phân quyền (Manage Employees & Authorization) |
| Người tạo: | Nguyễn Đại Trường Danh |
| Người cập nhật cuối: |  |
| Ngày tạo: | 07/10/2025 |
| Ngày cập nhật: |  |

| Tác nhân (Actor): | Admin (Quản trị viên) |
| --- | --- |
| Mô tả (Description): | Admin thực hiện các nghiệp vụ quản lý hồ sơ nhân viên (thêm, sửa, xóa), tạo/cập nhật/vô hiệu hóa tài khoản hệ thống cho nhân viên, gán vai trò (role) và theo dõi nhật ký hoạt động/đăng nhập (audit trail) |
| Điều kiện tiên quyết (Preconditions): | Admin đã đăng nhập thành công vào hệ thống với vai trò có quyền quản lý nhân viên và phân quyền |
| Kết quả sau cùng (Postconditions): | Thông tin nhân viên và tài khoản hệ thống được cập nhật chính xác trong cơ sở dữ liệu. Lịch sử thao tác (audit trail) được ghi lại. |
| Mức độ ưu tiên (Priority): | Cao |
| Tần suất sử dụng (Frequency of Use): | Hàng ngày |
| Luồng sự kiện chính (Normal Course of Events): | 1. Admin truy cập chức năng Quản lý Nhân viên.  2. Admin chọn Thao tác (Thêm/Sửa/Xóa/Tạo tài khoản/Gán vai trò).  3. **Thêm/Sửa nhân viên:** Hệ thống thực hiện Kiểm tra dữ liệu nhân viên  4. **Tạo tài khoản:** Hệ thống Gán vai trò (UC6) và Gửi email thông báo.  5. Admin có thể xem lịch sử đăng nhập/hoạt động hoặc Tạo báo cáo kiểm toán.  6. Hệ thống xác nhận thành công. |
| Luồng thay thế (Alternative Courses): | **Cập nhật tài khoản:** Thay vì thêm mới, Admin sửa thông tin tài khoản hiện có.  **Vô hiệu hóa tài khoản:** Thay vì xóa mềm nhân viên, Admin vô hiệu hóa tài khoản, có thể Gửi email thông báo |
| Ngoại lệ (Exceptions): | 1. **Kiểm tra dữ liệu thất bại:** Nếu dữ liệu nhân viên (ví dụ: số điện thoại, lương) không hợp lệ, hệ thống báo lỗi và không cho lưu.  2. **Thiếu quyền:** Nếu tài khoản thiếu quyền cố gắng truy cập chức năng quản lý, hệ thống trả về HTTP 403 hoặc thông báo "Không có quyền". |
| Bao gồm (Includes): | - **Validate Employee Data:** Được gọi khi Thêm/Sửa nhân viên.  - **Create System Account:** Được gọi sau khi Thêm nhân viên.  - **Assign Role:** Được gọi khi Tạo tài khoản.  - **Check Permission :** Được gọi khi Gán vai trò (để đảm bảo quyền được gán hợp lệ). |
| Mở rộng (Extends): | - **Update Account:** Mở rộng cho Sửa thông tin nhân viên.  - **Deactivate Account:** Mở rộng cho Xóa nhân viên (UC3).  - **Send Email Notification:** Mở rộng cho Vô hiệu hóa tài khoản. |
| Yêu cầu đặc biệt (Special Requirements): | Hệ thống phải hỗ trợ phân quyền theo vai trò (RBAC) với các vai trò tối thiểu: Admin, Lễ tân, Thu ngân, Phục vụ. Mật khẩu phải được lưu bằng cơ chế hashing mạnh (bcrypt/argon2) và hỗ trợ 2FA cho tài khoản Admin. |
| Giả định (Assumptions): | - Cơ sở dữ liệu phòng hoạt động bình thường. - Kết nối mạng ổn định.  - Nhân viên được đào tạo sử dụng hệ thống. Dữ liệu nhân viên được nhập là chính xác và hợp lệ. |
| Ghi chú & Vấn đề (Notes and Issues): | Việc "Xóa nhân viên" (UC3) nên là xóa mềm (soft-delete) để giữ lịch sử giao dịch. |

## 4.8 Quản lý Thanh toán và Hóa đơn

| Use Case ID: | UC8 |
| --- | --- |
| Tên Use Case: | Quản lý Thanh toán và Hóa đơn (Payment and Invoice Management) |
| Người tạo: | Nguyễn Đại Trường Danh |
| Người cập nhật cuối: |  |
| Ngày tạo: | 07/10/2025 |
| Ngày cập nhật: |  |

| Tác nhân (Actor): | Lễ tân (Receptionist), Cổng thanh toán (Payment Gateway) |
| --- | --- |
| Mô tả (Description): | Chức năng này cho phép **Lễ tân** thực hiện toàn bộ quy trình nghiệp vụ khi khách hàng trả phòng. Quy trình bao gồm việc tự động tính toán tổng chi phí (tiền phòng, dịch vụ, phụ thu), xử lý thanh toán qua nhiều hình thức khác nhau (tiền mặt, thẻ tín dụng qua cổng thanh toán), và cuối cùng là tạo và in hóa đơn tài chính cho khách hàng. |
| Điều kiện tiên quyết (Preconditions): | 1. Lễ tân đã đăng nhập thành công vào hệ thống với đúng vai trò và quyền hạn.  2. Tồn tại một phiếu thuê phòng của khách hàng đang ở trạng thái hoạt động ("Đang sử dụng") và sẵn sàng để làm thủ tục trả phòng. |
| Kết quả sau cùng (Postconditions): | **Thành công:** • Giao dịch thanh toán được ghi nhận thành công. • Hóa đơn được tạo và lưu trữ trong hệ thống. • Trạng thái của phiếu thuê phòng được cập nhật thành "Đã thanh toán". • Trạng thái của phòng được cập nhật thành "Cần dọn dẹp".  **Thất bại:** • Giao dịch không được thực hiện. • Hóa đơn không được tạo. • Trạng thái của phiếu thuê phòng và phòng không thay đổi. |
| Mức độ ưu tiên (Priority): | Cao |
| Tần suất sử dụng (Frequency of Use): | Hàng ngày |
| Luồng sự kiện chính (Normal Course of Events): | 1. Lễ tân chọn chức năng "Trả phòng" trên giao diện quản lý phòng.  2. Lễ tân chọn phòng mà khách hàng muốn trả.  3. Hệ thống tự động **tính toán toàn bộ chi phí** và hiển thị chi tiết lên màn hình.  4. Lễ tân xác nhận tổng số tiền với khách hàng.  5. Lễ tân **chọn phương thức thanh toán** mà khách hàng yêu cầu.  6. **Nếu thanh toán bằng tiền mặt:** Lễ tân nhập số tiền nhận và hệ thống xác nhận.  7. **Nếu thanh toán bằng thẻ/online:** Hệ thống gửi yêu cầu đến **Cổng thanh toán** và chờ phản hồi.  8. Sau khi thanh toán thành công, hệ thống tự động tạo hóa đơn với số hóa đơn duy nhất.  9. Hệ thống **cập nhật trạng thái** của phiếu thuê và phòng.  10. Hệ thống hiển thị hóa đơn lên màn hình và Lễ tân có thể tùy chọn in hóa đơn cho khách. |
| Luồng thay thế (Alternative Courses): | • **Thanh toán kết hợp:** Khách hàng muốn thanh toán bằng nhiều phương thức (ví dụ: một phần tiền mặt, một phần quẹt thẻ). Hệ thống cho phép Lễ tân ghi nhận nhiều giao dịch cho cùng một hóa đơn cho đến khi tổng số tiền được thanh toán đủ. |
| Ngoại lệ (Exceptions): | - **1: Thanh toán qua cổng bị từ chối.** Tại bước 7, nếu Cổng thanh toán báo lỗi (sai thông tin thẻ, không đủ số dư), hệ thống sẽ hiển thị thông báo lỗi cho Lễ tân. Lễ tân có thể yêu cầu khách hàng thử lại hoặc đổi sang phương thức thanh toán khác (quay lại bước 5).  - **2: Mất kết nối mạng.** Nếu hệ thống không thể kết nối đến Cổng thanh toán, một thông báo lỗi sẽ xuất hiện và chỉ các phương thức thanh toán offline (tiền mặt) mới khả dụng.  - **3: Lỗi máy in.** Tại bước 10, nếu Lễ tân chọn in hóa đơn nhưng máy in bị lỗi (hết giấy, offline), hệ thống sẽ hiển thị thông báo lỗi. Lễ tân có thể khắc phục và thực hiện lại hành động in mà không ảnh hưởng đến dữ liệu đã lưu. |
| Bao gồm (Includes): | * Tính tổng tiền (Calculate Total) * Chọn phương thức thanh toán (Select Payment Method) * Tích hợp cổng thanh toán (Payment Gateway Integration) * Cập nhật trạng thái (Update Status) |
| Mở rộng (Extends): | **In hóa đơn (Print Invoice):** Chức năng này chỉ được thực hiện tùy chọn sau khi hóa đơn đã được tạo thành công. |
| Yêu cầu đặc biệt (Special Requirements): | * 1: Hệ thống phải tuân thủ các quy định hiện hành về hóa đơn, chứng từ và thuế của pháp luật Việt Nam. * 2: Mọi giao tiếp với Cổng thanh toán phải được mã hóa an toàn (sử dụng giao thức HTTPS). * 3: Hệ thống tuyệt đối không được lưu trữ các thông tin nhạy cảm của thẻ thanh toán (như số thẻ đầy đủ, mã CVV) để đảm bảo tuân thủ tiêu chuẩn an toàn PCI DSS. |
| Giả định (Assumptions): | * Hệ thống đã được cấu hình đúng các loại phí, thuế suất, và các hình thức thanh toán được khách sạn chấp nhận. * Khách sạn có đường truyền Internet ổn định để đảm bảo các giao dịch thanh toán online không bị gián đoạn. * Máy tính của Lễ tân đã được cài đặt driver và kết nối tới máy in hóa đơn tương thích. |
| Ghi chú & Vấn đề (Notes and Issues): | Cần xem xét phát triển một chức năng riêng để xử lý các trường hợp phức tạp hơn như: hủy hóa đơn, xuất lại hóa đơn, xử lý hoàn tiền (refund). |