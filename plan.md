

mục đích để xây dựng tính năng phân tích fanpage đối thủ. user sẽ nhập vào tối đa 3 link fanpage, sau đó code sẽ gọi api lấy danh sách bài viết của các fanpage ra.
api lấy bài viết như sau:
curl -i -X GET \
 "https://graph.facebook.com/v24.0/genzcogivui/posts?fields=message%2Ccreated_time%2Cattachments%7Bmedia%2Cmedia_type%7D%2Cfull_picture%2Ccomments.limit(50)%7Bmessage%7D&access_token="

 data trả về là:
 {
  "data": [
    {
      "message": "Nào cũng nói được",
      "created_time": "2026-03-27T08:31:24+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/657485687_1331011762410080_6025513823628967294_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=104&ccb=1-7&_nc_sid=7b2446&_nc_ohc=ENGWj4Ib0ucQ7kNvwEZzhnD&_nc_oc=AdqffMeNr3pv55sSN99zKmJQfiuKwf1SbuH4wpM-grbRVKrrHUAlzSOHD6qCwuvMBK8&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfyoF07ijJwN7VvVangOdcAVgOIvHawupLE5NUeCIN0HIQ&oe=69CC1BC0",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/657485687_1331011762410080_6025513823628967294_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=104&ccb=1-7&_nc_sid=7b2446&_nc_ohc=ENGWj4Ib0ucQ7kNvwEZzhnD&_nc_oc=AdqffMeNr3pv55sSN99zKmJQfiuKwf1SbuH4wpM-grbRVKrrHUAlzSOHD6qCwuvMBK8&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfyoF07ijJwN7VvVangOdcAVgOIvHawupLE5NUeCIN0HIQ&oe=69CC1BC0",
      "comments": {
        "data": [
          {
            "message": "",
            "id": "1331011825743407_1503672388051149"
          },
          {
            "message": "",
            "id": "1331011825743407_1295922915777541"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MgZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1331011825743407"
    },
    {
      "message": "Anh tài xế kiểu: \"Không ngờ tới phải không\" 😂

Cre: emailacuaanh",
      "created_time": "2026-03-27T06:25:28+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/656963051_1330944799083443_3532742633840404865_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=1&ccb=1-7&_nc_sid=7b2446&_nc_ohc=OyNugg_h4rsQ7kNvwFM06O2&_nc_oc=Adq2ueuA-N0puHHZYa7p7n2o--adYYD93X09NDeSu8ccHRjdlgB5zyf0WWIG-F5-iFg&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afw51m7c-UsNclsJRsYbnDj-Td9HJsC7x4mO59LqBDkSzw&oe=69CC1210",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/656963051_1330944799083443_3532742633840404865_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=1&ccb=1-7&_nc_sid=7b2446&_nc_ohc=OyNugg_h4rsQ7kNvwFM06O2&_nc_oc=Adq2ueuA-N0puHHZYa7p7n2o--adYYD93X09NDeSu8ccHRjdlgB5zyf0WWIG-F5-iFg&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afw51m7c-UsNclsJRsYbnDj-Td9HJsC7x4mO59LqBDkSzw&oe=69CC1210",
      "comments": {
        "data": [
          {
            "message": "hóa ra tôi chỉ là tiện đường anh chở đi thoi",
            "id": "1330944835750106_1517782806585639"
          },
          {
            "message": "Văn Quốc 😂",
            "id": "1330944835750106_4271384473190389"
          },
          {
            "message": "Hà Nhi",
            "id": "1330944835750106_1406522521157407"
          },
          {
            "message": "Ang Ngô",
            "id": "1330944835750106_929532099718568"
          },
          {
            "message": "Và kể từ đó...",
            "id": "1330944835750106_779068421943283"
          },
          {
            "message": "Vâng",
            "id": "1330944835750106_1600069524618844"
          }
        ],
        "paging": {
          "cursors": {
            "before": "NgZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1330944835750106"
    },
    {
      "message": "HAPPY BIRTHDAY UNIKEY 1994-2026 🎂🎉

Để chúng ta có được những bài ph-ốt với đầy đủ dấu câu như ngày hôm nay, thì đừng quên cảm ơn đến Tác giả của Unikey Phạm Kim Long - Người con Bách Khoa 😂",
      "created_time": "2026-03-27T04:00:59+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658808120_1330866835757906_8024412990141778322_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=J5NZR4mHODUQ7kNvwF9puEL&_nc_oc=Adp-_clgnLqBHQLIW8jfpn94DLkktmI5Vpo-itMxGr8UzRFN7X-vWh9vSGHXsS-appM&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afy88NtJovwUAMOY6r1mBhQnjFHb3vnMmsINn2IjREekag&oe=69CC18AB",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658808120_1330866835757906_8024412990141778322_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=J5NZR4mHODUQ7kNvwF9puEL&_nc_oc=Adp-_clgnLqBHQLIW8jfpn94DLkktmI5Vpo-itMxGr8UzRFN7X-vWh9vSGHXsS-appM&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afy88NtJovwUAMOY6r1mBhQnjFHb3vnMmsINn2IjREekag&oe=69CC18AB",
      "id": "101844588595011_1330866875757902"
    },
    {
      "message": "Tổng thống Trump đã có một tiết lộ vừa thú vị, vừa gây sốc. Đó là việc ông thừa nhận Iran muốn ông trở thành nhà lãnh đạo tối cao của Iran. 

Tổng thống phát biểu rằng các nhà lãnh đạo Iran đều muốn ông ấy trở thành lãnh đạo vì không một ai ở Iran dám nhận chức lãnh đạo. Tất cả đều sợ bị Hoa Kỳ tieudiet và sợ bị người dân Iran sathai

Tuy nhiên, Tổng thống Trump cho biết là ông ấy đã từ chối đề nghị của phía Iran.",
      "created_time": "2026-03-27T01:03:44+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658132444_1330767952434461_3118672126531298735_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=107&ccb=1-7&_nc_sid=7b2446&_nc_ohc=i3WO3NshSVQQ7kNvwG1M03m&_nc_oc=AdpJGsBGe0q7qz1QYNpzfHTwqbm7bi8-eBY2hM4u5p8U3f2m0qnPz8_BbaE_RWOvsSU&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afx29DNWdM59F2lhYJm2wFV-D8a4lchx163LMRvQHVBc-Q&oe=69CBFD87",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658132444_1330767952434461_3118672126531298735_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=107&ccb=1-7&_nc_sid=7b2446&_nc_ohc=i3WO3NshSVQQ7kNvwG1M03m&_nc_oc=AdpJGsBGe0q7qz1QYNpzfHTwqbm7bi8-eBY2hM4u5p8U3f2m0qnPz8_BbaE_RWOvsSU&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afx29DNWdM59F2lhYJm2wFV-D8a4lchx163LMRvQHVBc-Q&oe=69CBFD87",
      "comments": {
        "data": [
          {
            "message": "Che toàn từ hay, t không hiểu gì cả 😂",
            "id": "1330768122434444_1972748360301288"
          },
          {
            "message": "ngta sợ là đúng rồi ai chả sợ, ông ác nên ông k sợ",
            "id": "1330768122434444_25741177955561691"
          },
          {
            "message": "Iran muốn thì trump nhận đi :))",
            "id": "1330768122434444_1459656605945302"
          },
          {
            "message": "bố đẻ của chú hề zel :))",
            "id": "1330768122434444_839563339161387"
          },
          {
            "message": "",
            "id": "1330768122434444_1729261134723783"
          },
          {
            "message": "Y học phương tây mà trị còn không hết thì mình thử qua dùng thuốc bắc hay thuốc nam xem có thuyên giảm không , chứ kiểu này khổ người dân và xã hội vc ra 🥲",
            "id": "1330768122434444_1873177654070486"
          },
          {
            "message": "Tin tào lao mà sồn sồn như đúng rồi, bảo dân trí thấp   thì ba que, cali, khát nước, thấp tệ nửa thì lôi những  bộ phận dưới thắc lưng ra tuyên dương😁",
            "id": "1330768122434444_1276344743853691"
          },
          {
            "message": "Ổng đang nói móc với khiêu khích đấy:)) mới tiêu diệt thêm 2  lãnh đạo của iran đấy",
            "id": "1330768122434444_978190854647736"
          },
          {
            "message": "Bị bòm bòm nhiều quá hoá điên r à😂",
            "id": "1330768122434444_965443689343034"
          },
          {
            "message": "Vị Tổng thống khát khao đc công nhận về mọi mặt nhất và tấu hài nhất :)) độc tài mà làm lãnh đạo thì Loạn là đúng",
            "id": "1330768122434444_1593245325239605"
          },
          {
            "message": "Ai đó nói với vịt donald ko nên chơi đá trước khi lên bục cầm mic hộ cái",
            "id": "1330768122434444_1443480461123604"
          },
          {
            "message": "Cho đi đóng hài thì nhiều view đấy ông già 🐦",
            "id": "1330768122434444_1473965424178905"
          },
          {
            "message": "",
            "id": "1330768122434444_26202611636015493"
          },
          {
            "message": "",
            "id": "1330768122434444_911779461739268"
          },
          {
            "message": "Làm lãnh đạo tối cao của Iran để ăn bom thay lãnh đạo Iran 🤣🤣🤣",
            "id": "1330768122434444_2419671188506279"
          },
          {
            "message": "ông này mà ở VN 1 ngày chắc bị 3 4 lần cái 7 trịu rưỡi quâ",
            "id": "1330768122434444_1569922751149027"
          },
          {
            "message": "Có clip Veveezuela đang muốn đúc tượng Trump kìa",
            "id": "1330768122434444_941374571708596"
          },
          {
            "message": "🙄 vl đang nghe tin mỗi ngày từ kẻ tâm thần",
            "id": "1330768122434444_931009622866105"
          },
          {
            "message": "Bảo sao cung cấp vũ khí tài nguyên cho u cà chung rạp xiếc với nhau ko",
            "id": "1330768122434444_913652118235153"
          },
          {
            "message": "trump cũng đang sợ vãi đái ra đấy đừng bốc phét",
            "id": "1330768122434444_34340565622254133"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MjIZD",
            "after": "MwZDZD"
          },
          "next": "https://graph.facebook.com/v24.0/101844588595011_1330768122434444/comments?access_token=EAABsbCS1iHgBRObZBU3pvSzqsmL81lMy2qCEKgLzuro7Oti6NZBS9To5FwvpivEW0EkMsJpd69q63rTv9r7Vwi2AbloRkZC2eaZAdB1nd0TpLpfWbMsSorq2bDAn73eGh5TpZBaQVDzPKMWEOiPYz1L2rqKmEKzlQ19x6NCccNnd9VN27f6aNCrsS24suu9dpmkoNkUYqN14FlAZDZD&pretty=0&fields=message&limit=20&after=MwZDZD"
        }
      },
      "id": "101844588595011_1330768122434444"
    },
    {
      "message": "🚨 NGƯỜI DÙNG TIKTOK BTS JUNGKOOK MIỆT MÀI FOLLOW CẢ K-POP: CON SỐ ĐÃ LÊN 93 TÀI KHOẢN 💜",
      "created_time": "2026-03-26T15:55:36+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658468508_1330455559132367_2930041573638941842_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=101&ccb=1-7&_nc_sid=7b2446&_nc_ohc=R1Gh6LBQyvYQ7kNvwE7nkXD&_nc_oc=Adr19a_b6JoMISGENTgP6bwu9R0EE6enx4MD3ZOqiCfO7isU8GZo-Su30i7ZWSN9OmU&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a3a8&oh=00_AfzI-QaEIgNjT_PjaAHgY-uwmdpXCBqlrVdlsUH_X7Vm5g&oe=69CC1697",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658468508_1330455559132367_2930041573638941842_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=101&ccb=1-7&_nc_sid=7b2446&_nc_ohc=R1Gh6LBQyvYQ7kNvwE7nkXD&_nc_oc=Adr19a_b6JoMISGENTgP6bwu9R0EE6enx4MD3ZOqiCfO7isU8GZo-Su30i7ZWSN9OmU&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a3a8&oh=00_AfzI-QaEIgNjT_PjaAHgY-uwmdpXCBqlrVdlsUH_X7Vm5g&oe=69CC1697",
      "comments": {
        "data": [
          {
            "message": "m định dẹp loạn 12 sứ quân hả con",
            "id": "1330455599132363_1333668672115333"
          },
          {
            "message": "",
            "id": "1330455599132363_3310851345756285"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MgZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1330455599132363"
    },
    {
      "message": "GIẢI MÃ TÊN GỌI MAJOR VÀ MINO CỦA NHÀ JUSTATEE

Gia đình JustaTee chia sẻ ý nghĩa tên gọi của hai cậu con trai: Major và Mino (Minor). Trong nhạc lý, đây là hai hệ thống âm giai và giọng điệu cơ bản, thường được gọi là giọng Trưởng và giọng Thứ.

Major (Trưởng) thường gắn với sắc thái tươi sáng, mạnh mẽ. Thuật ngữ này được dùng để chỉ các âm giai, hợp âm hoặc giọng trưởng, như C Major (Đô trưởng) hay G Major (Sol trưởng).

Trong khi đó, Minor (Thứ) mang màu sắc trầm lắng, sâu sắc hơn. Đây là khái niệm chỉ các âm giai, hợp âm hoặc giọng thứ, chẳng hạn A Minor (La thứ) hay E Minor (Mi thứ).

Việc đặt tên Major và Minor vừa thể hiện cá tính của “ông bố âm nhạc” JustaTee, mà còn gợi nên hình ảnh hai sắc thái đối lập nhưng bổ sung cho nhau, giống như cách những giai điệu trưởng và thứ cùng tạo nên sự phong phú trong âm nhạc và trong cuộc sống.",
      "created_time": "2026-03-26T14:34:44+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658220857_1330400852471171_9011548133331839246_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=Y7TDZnA0f3EQ7kNvwGsQXc9&_nc_oc=Adp2elch6nKDajo7X_txMMAqGsW_iZaqyKURMAUW107b9xbuy3cj5Dd6sChvWlFb9oc&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfzIlrwIVbN5Op5rmzjJfOV8o2BVDUIJDOFYOeTHF4Yzog&oe=69CC08BD",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658220857_1330400852471171_9011548133331839246_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=Y7TDZnA0f3EQ7kNvwGsQXc9&_nc_oc=Adp2elch6nKDajo7X_txMMAqGsW_iZaqyKURMAUW107b9xbuy3cj5Dd6sChvWlFb9oc&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfzIlrwIVbN5Op5rmzjJfOV8o2BVDUIJDOFYOeTHF4Yzog&oe=69CC08BD",
      "id": "101844588595011_1330400899137833"
    },
    {
      "message": "Bớt xin tóc của Phùng Khánh Linh lại đi 😔

Cre: Đỗ Linh",
      "created_time": "2026-03-26T14:11:21+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/660372696_1330384102472846_8377117112757416968_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=106&ccb=1-7&_nc_sid=7b2446&_nc_ohc=lCtpeGmBNtUQ7kNvwGYsvIp&_nc_oc=AdqG8Mcm8TmSZSwIJ1SwratJkUq9giIcuKvbBQRK34Tminh4IMZq7Hn_uINdFey_nFI&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfxBCVwMw-3KbeaZ-l9_YVHzsNH1G6XrTmxTTLHxpqAr1Q&oe=69CC13F6",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/660372696_1330384102472846_8377117112757416968_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=106&ccb=1-7&_nc_sid=7b2446&_nc_ohc=lCtpeGmBNtUQ7kNvwGYsvIp&_nc_oc=AdqG8Mcm8TmSZSwIJ1SwratJkUq9giIcuKvbBQRK34Tminh4IMZq7Hn_uINdFey_nFI&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfxBCVwMw-3KbeaZ-l9_YVHzsNH1G6XrTmxTTLHxpqAr1Q&oe=69CC13F6",
      "comments": {
        "data": [
          {
            "message": "Thôi thương chị đội tóc giả đi , gòi tặng fan mỗi cọng🥰❤️ thuơg chị sợ ngày chị hói đầu 🥲💦",
            "id": "1330384125806177_4272109673057935"
          },
          {
            "message": "",
            "id": "1330384125806177_2219130771951547"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MgZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1330384125806177"
    },
    {
      "message": "🚨 SAU KHOAI LANG THANG VÀ HAI MẢNH ĐỜI Ở THUỴ SĨ, PHÙNG KHÁNH LINH TIẾP TỤC GIỮ CHUỖI ĐỘNG VIÊN NGẪU NHIÊN TRÊN THREADS VÀ CÁI KẾT: 

Cre: thongxov",
      "created_time": "2026-03-26T13:43:12+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/659073446_1330364169141506_7306926248351897506_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=103&ccb=1-7&_nc_sid=7b2446&_nc_ohc=XAFpDGx7fasQ7kNvwHWtZRr&_nc_oc=AdqIwcdpqtlYsG5yqkzpEyd8sCfHJ2OMS8lA_FD3EnRuIgWji9trLAEKSAGkYZxH_cw&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afyi2Hn-AKf9wXqG8Rkf6d5cirrcO5rT3BBAumqc02Y7hw&oe=69CC2143",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/659073446_1330364169141506_7306926248351897506_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=103&ccb=1-7&_nc_sid=7b2446&_nc_ohc=XAFpDGx7fasQ7kNvwHWtZRr&_nc_oc=AdqIwcdpqtlYsG5yqkzpEyd8sCfHJ2OMS8lA_FD3EnRuIgWji9trLAEKSAGkYZxH_cw&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afyi2Hn-AKf9wXqG8Rkf6d5cirrcO5rT3BBAumqc02Y7hw&oe=69CC2143",
      "comments": {
        "data": [
          {
            "message": "",
            "id": "1330364199141503_906036515750548"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MQZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1330364199141503"
    },
    {
      "message": "TUẤN HẢI MỞ TỈ SỐ, CAMERAMAN CŨNG GHI BÀN 🥰",
      "created_time": "2026-03-26T12:23:17+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 540,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/657517970_1330309819146941_3145018068143226650_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=uaNXQuvF1nYQ7kNvwFJSpkV&_nc_oc=Adqws92bv4KKW9HpQLbdZZxN_QtDKI2Exolen63xV6S8C6VlPOu2BBCrL3cmOgYzlNQ&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwFyh3rHjzCFNJu3WvRHRyZLoUCNSy9ZXApZOEkCKn8QA&oe=69CBFE96",
                "width": 960
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/657517970_1330309819146941_3145018068143226650_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=uaNXQuvF1nYQ7kNvwFJSpkV&_nc_oc=Adqws92bv4KKW9HpQLbdZZxN_QtDKI2Exolen63xV6S8C6VlPOu2BBCrL3cmOgYzlNQ&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwFyh3rHjzCFNJu3WvRHRyZLoUCNSy9ZXApZOEkCKn8QA&oe=69CBFE96",
      "comments": {
        "data": [
          {
            "message": "Vâng ạ🥰",
            "id": "1330309885813601_4181196438809007"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MQZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1330309885813601"
    },
    {
      "message": "Chị đầu năm, em cuối năm... không sinh đôi nhưng học cùng lớp 😆

Nguồn: mekemdayroi",
      "created_time": "2026-03-26T11:37:45+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/657325296_1330281485816441_5235244389031115216_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=_3o1xMz4KxMQ7kNvwFbV60j&_nc_oc=AdrWXJIrHV6bXBD0GexBvg1s23mHkUeKMqTgTefkCnh4FEQZ5vQxwnVUNv_XuI9PvQ4&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a3a8&oh=00_Afz9DWpC6s2z2LTJzGXeHN4lfYoCFf8hQ5c2xDaih504jA&oe=69CC08DC",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/657325296_1330281485816441_5235244389031115216_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=_3o1xMz4KxMQ7kNvwFbV60j&_nc_oc=AdrWXJIrHV6bXBD0GexBvg1s23mHkUeKMqTgTefkCnh4FEQZ5vQxwnVUNv_XuI9PvQ4&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a3a8&oh=00_Afz9DWpC6s2z2LTJzGXeHN4lfYoCFf8hQ5c2xDaih504jA&oe=69CC08DC",
      "comments": {
        "data": [
          {
            "message": "Ánh Tuyết may quá vẫn còn cách 1 tuổi",
            "id": "1330281515816438_930111653217966"
          },
          {
            "message": "Tính để 2 ae học cùng lớp luôn đấy à",
            "id": "1330281515816438_1666494831012164"
          },
          {
            "message": "1 năm 2 đứa luôn🥹🥹",
            "id": "1330281515816438_2029746198398372"
          },
          {
            "message": "Trinh Sandy=)) cườii bò",
            "id": "1330281515816438_1238337751845950"
          },
          {
            "message": "Chị Nguyễn Huyền à Mai Hoà",
            "id": "1330281515816438_919324317656968"
          },
          {
            "message": "Vâng ạ🥰",
            "id": "1330281515816438_1297350768924545"
          },
          {
            "message": "Ngon luôn",
            "id": "1330281515816438_958380489884853"
          },
          {
            "message": "Minh Chuyên đẳng cấp quá",
            "id": "1330281515816438_1447800463601638"
          },
          {
            "message": "",
            "id": "1330281515816438_1243180400836359"
          },
          {
            "message": "Mỹ Tâm",
            "id": "1330281515816438_26166903642993703"
          },
          {
            "message": "Ngoc Ngaa",
            "id": "1330281515816438_2129791714422277"
          },
          {
            "message": "Lý Nguyễn 🤣🤣🤣",
            "id": "1330281515816438_947106124387700"
          },
          {
            "message": "Đức Thắng",
            "id": "1330281515816438_1637113817492012"
          },
          {
            "message": "Nguyễn Tiến Đô 🤣",
            "id": "1330281515816438_1584858349242957"
          },
          {
            "message": "troi troi,gioi ghe,2vo ck ban ngay di lam,toi con tang ca,tranh thu.",
            "id": "1330281515816438_1620790819165508"
          },
          {
            "message": "Vớ vẩn, sinh được 2 tháng bầu 5 tháng",
            "id": "1330281515816438_2007594393475262"
          },
          {
            "message": "2 vc này kinh dị thật.",
            "id": "1330281515816438_1249695510708827"
          },
          {
            "message": "Mình k thấy có j vui cả mình nghe nói nếu như thế mẹ bầu thì em bé sẽ k có sữa để uống hay sao ý",
            "id": "1330281515816438_3850370951937499"
          },
          {
            "message": "🍀🍀 Bảo hiểm cược thua ngại gì thử
🍀Hoàn tiền đến 100%
Ngại gì không săn https://fly88.uk",
            "id": "1330281515816438_1354371553389736"
          },
          {
            "message": "Thúy Ngaa đấy xem đi bà vs chồng bà đó !!!",
            "id": "1330281515816438_1283349070423613"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MjcZD",
            "after": "NwZDZD"
          },
          "next": "https://graph.facebook.com/v24.0/101844588595011_1330281515816438/comments?access_token=EAABsbCS1iHgBRObZBU3pvSzqsmL81lMy2qCEKgLzuro7Oti6NZBS9To5FwvpivEW0EkMsJpd69q63rTv9r7Vwi2AbloRkZC2eaZAdB1nd0TpLpfWbMsSorq2bDAn73eGh5TpZBaQVDzPKMWEOiPYz1L2rqKmEKzlQ19x6NCccNnd9VN27f6aNCrsS24suu9dpmkoNkUYqN14FlAZDZD&pretty=0&fields=message&limit=20&after=NwZDZD"
        }
      },
      "id": "101844588595011_1330281515816438"
    },
    {
      "message": "ỦA CHỊ GÌ ĐÓ ƠI... ?🤔",
      "created_time": "2026-03-26T10:59:55+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 405,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t15.5256-10/658994312_2194094864676684_6374035112579070389_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=108&ccb=1-7&_nc_sid=5fad0e&_nc_ohc=VR41iVIFkIQQ7kNvwEXXoTE&_nc_oc=AdqcXRXBerRSoDH7uiwAku0_SZ1W8F9HHh2KSMvs6useP5Fi-3S0B24NPcVH13ayBYs&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afz_KqT1Jfd0AODaSWvMGl_oBQM7piYrNo18OtUzqonKSA&oe=69CC1B1D",
                "width": 720
              },
              "source": "https://scontent.fbmv1-1.fna.fbcdn.net/o1/v/t2/f2/m366/AQN-lEtuPpW6qeIqRft4-ATkcQrWcGguPR1rezXo88heXK2mw7OuUzR8AIdiCFuSdtJntJCwsxbVAZqMu-gt4Na-w2WpdjX8JoSi6Kq_uX57fg.mp4?_nc_cat=104&_nc_oc=AdpuKhcsZxWzXdBo_Z0upTEAeXYL095pTayvpJaSKx5lXeTgOUkyi6vmC1rF1Ywy7ik&_nc_sid=5e9851&_nc_ht=scontent.fbmv1-1.fna.fbcdn.net&_nc_ohc=HWegTXrkn3IQ7kNvwGbptP2&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoyODU2MzM2MzUxMzcyNTg0LCJhc3NldF9hZ2VfZGF5cyI6MCwidmlfdXNlY2FzZV9pZCI6MTAxMjIsImR1cmF0aW9uX3MiOjIxLCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=2258c5d54a757904&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC8xQzQwM0VENzNFRjQ3NDE4MERFNTQ0QTRDMDg0ODM5N19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzdGNDNBMEI3MDhEQTk1OUJGRDFFMzI3RkYxNzI1OUJFX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbQlKmZ1PSSChUCKAJDMywXQDT3S8an754YGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZSeAQA&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&_nc_zt=28&oh=00_AfyGSLg0gmcmqyY9zCLsp8GCFoKyIi6MDtVb3_kiqPmKzg&oe=69CC1868&bitrate=5145813&tag=dash_h264-basic-gen2_720p"
            },
            "media_type": "video"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t15.5256-10/658994312_2194094864676684_6374035112579070389_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=5fad0e&_nc_ohc=VR41iVIFkIQQ7kNvwEXXoTE&_nc_oc=AdqcXRXBerRSoDH7uiwAku0_SZ1W8F9HHh2KSMvs6useP5Fi-3S0B24NPcVH13ayBYs&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afy2ibKSGFTY1pcMW454e-eJ9TzNS_2o4-tE0IbCLK3neQ&oe=69CC1B1D",
      "comments": {
        "data": [
          {
            "message": "Vậy mới xứng danh pháp ninja lead 🐧",
            "id": "1330259122485344_1434105954847649"
          },
          {
            "message": "Chắc có ex ở trạm xăng:))",
            "id": "1330259122485344_1462276025618803"
          },
          {
            "message": "Pov: \" khi bạn đã quá ám ảnh những hình ảnh tai nạn trên mạng xã hội \"🤣",
            "id": "1330259122485344_1264747795095983"
          },
          {
            "message": "Chị định đổ xăng nhưng cây xăng đóng cửa,lên chị lại đi về 😂",
            "id": "1330259122485344_4159009534410286"
          },
          {
            "message": "Ng thành cong có lói đi riêng kkk",
            "id": "1330259122485344_1482078573617251"
          },
          {
            "message": "Nhìn thì có vẻ sợ xe tải nên đi kiểu đó. Nhưng đau biết rằng lỡ hướng ngược chiều có 1 chiếc xe tải khác thì sao",
            "id": "1330259122485344_26526930036946049"
          },
          {
            "message": "Chạy vậy mới an toàn chứ sao",
            "id": "1330259122485344_1320993019851918"
          },
          {
            "message": "Chị Tính ai dạy c đi xe như này đấy",
            "id": "1330259122485344_973033935379445"
          },
          {
            "message": "Nước đi này tại hạ xin bái phục😊🤣",
            "id": "1330259122485344_1226351452995088"
          },
          {
            "message": "Thử thách ko cho người khác biết nước đi tiếp theo",
            "id": "1330259122485344_822597433567263"
          },
          {
            "message": "Lật bài nói chuyện với lòng mình nha ✨",
            "id": "1330259122485344_1649312429491848"
          },
          {
            "message": "Cách an toàn",
            "id": "1330259122485344_1496312722132992"
          },
          {
            "message": "Đang định đổ xăng thấy giá cao quá nên đi ra🐧",
            "id": "1330259122485344_2981992222012099"
          },
          {
            "message": "Thái Việt đường thẳng ko đi đi đường vòng như z còn con xe phía sau nó thắng ko kịp thì liệm chứ an toàn gì, vs lại nó đag đi ngược chiều nữa
Cug có thể để xe to qua góc cua đó rồi vượt cug đc mà",
            "id": "1330259122485344_1596606474954697"
          },
          {
            "message": "",
            "id": "1330259122485344_926067183648051"
          },
          {
            "message": "Phương MiNơ",
            "id": "1330259122485344_1633272384489641"
          },
          {
            "message": "thế còn an toàn hơn đó nhỉ",
            "id": "1330259122485344_893479927025741"
          },
          {
            "message": "chạy vô mới thấy E95 34k",
            "id": "1330259122485344_934083425928395"
          },
          {
            "message": "Phạm Quốc trung bình người đi lead",
            "id": "1330259122485344_1455462926277825"
          },
          {
            "message": "Vượt khoảng cách an toàn",
            "id": "1330259122485344_1822360689151096"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MjIZD",
            "after": "MwZDZD"
          },
          "next": "https://graph.facebook.com/v24.0/101844588595011_1330259122485344/comments?access_token=EAABsbCS1iHgBRObZBU3pvSzqsmL81lMy2qCEKgLzuro7Oti6NZBS9To5FwvpivEW0EkMsJpd69q63rTv9r7Vwi2AbloRkZC2eaZAdB1nd0TpLpfWbMsSorq2bDAn73eGh5TpZBaQVDzPKMWEOiPYz1L2rqKmEKzlQ19x6NCccNnd9VN27f6aNCrsS24suu9dpmkoNkUYqN14FlAZDZD&pretty=0&fields=message&limit=20&after=MwZDZD"
        }
      },
      "id": "101844588595011_1330259122485344"
    },
    {
      "message": "Biểu cảm của một thanh niên (dự là người Việt) khi gặp BTS: Tôi biết ổng nói gì nhưng tôi không thể chứng minh 🤣",
      "created_time": "2026-03-26T07:42:19+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 405,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t15.5256-10/658407737_1702584820727313_1469981758151595372_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=110&ccb=1-7&_nc_sid=5fad0e&_nc_ohc=S5yn0e5f4G8Q7kNvwHx9agO&_nc_oc=AdrqAkMH7d_5YNWKpB2IarfdRSo_vvGLn1v9mVJdHggfGPfxv5FqxjaVQM1Y07pfReY&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfxAbZpKAphsfOOtLLJwlqTpjxzProJlO_meElljFr3ozA&oe=69CC1AE1",
                "width": 720
              },
              "source": "https://scontent.fbmv1-1.fna.fbcdn.net/o1/v/t2/f2/m366/AQOPfGzG3fWDOH8tfp9U8GxUdGF-9lUTA8jSO8--1N1QUaRRa7XFdCnBYvzGW0SluKKvqVCteZ4uzuhdzFPRsjznZf1QCT8chv4pg64NYrr5Dw.mp4?_nc_cat=102&_nc_oc=AdohDlhc8olgwE_M10MS_GT0xAJF0gnVV0HFRReYHrTG6prj1esjB00AcgH99FkcCOI&_nc_sid=5e9851&_nc_ht=scontent.fbmv1-1.fna.fbcdn.net&_nc_ohc=0yFeZwC-jlYQ7kNvwH4XCC6&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMTI4MC5kYXNoX2gyNjQtYmFzaWMtZ2VuMl83MjBwIiwieHB2X2Fzc2V0X2lkIjoxMjU1NzI1NjIwMDQ4ODk0LCJhc3NldF9hZ2VfZGF5cyI6MSwidmlfdXNlY2FzZV9pZCI6MTAxMjIsImR1cmF0aW9uX3MiOjYsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=432322d62f41536b&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9BQTQzNjY0MTgxODE4OTJGNjdENzhFNDEyQkIxQURBM19tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50LzhENDA4RTA1RTIzRjgyMkYxMjI4RkI2RTExMjBCM0E0X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACb8z6X47IS7BBUCKAJDMywXQBjaHKwIMScYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZSeAQA&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&_nc_zt=28&oh=00_Afz4mW0vFnpvMRiznmEyv19vHxHmIyJcPiB5mktUO2m9KQ&oe=69CC2A96&bitrate=961273&tag=dash_h264-basic-gen2_720p"
            },
            "media_type": "video"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t15.5256-10/658407737_1702584820727313_1469981758151595372_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=5fad0e&_nc_ohc=S5yn0e5f4G8Q7kNvwHx9agO&_nc_oc=AdrqAkMH7d_5YNWKpB2IarfdRSo_vvGLn1v9mVJdHggfGPfxv5FqxjaVQM1Y07pfReY&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afzvv9g1YSVzZpXKbjAeC5DHwTN03Lkwu7SR6NXxaxttGA&oe=69CC1AE1",
      "comments": {
        "data": [
          {
            "message": "Vâng ạ🥰",
            "id": "1330147422496514_880893961628875"
          },
          {
            "message": "Ổng nói ôi vãi 😂😂😂",
            "id": "1330147422496514_782675654584938"
          },
          {
            "message": "Lê Nhung phải t là còn hơn thế",
            "id": "1330147422496514_2756865181313350"
          },
          {
            "message": "Phương Linh",
            "id": "1330147422496514_1654246472431411"
          },
          {
            "message": "Oi vailon, ôi vãiiii",
            "id": "1330147422496514_4182631451988936"
          },
          {
            "message": "",
            "id": "1330147422496514_2138239480071197"
          },
          {
            "message": "Với 1 thằng hay chửi bậy như t thì khẩu hình mômf kia là : ôi vãi l đm",
            "id": "1330147422496514_1667505764266720"
          },
          {
            "message": "Cailonjday hả:)",
            "id": "1330147422496514_25892258893803241"
          },
          {
            "message": "bảo sao tới ổng là tắt tiếng",
            "id": "1330147422496514_2094368314753157"
          },
          {
            "message": "Lợn Sama vai lon",
            "id": "1330147422496514_3799371620202005"
          },
          {
            "message": "Vâng",
            "id": "1330147422496514_1647185476427856"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MTEZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1330147422496514"
    },
    {
      "message": "🥰 Ngại hết cả V (BTS): Định kể Jungkook hay trêu nhưng mọi người nghe nhầm thành “hôn”.",
      "created_time": "2026-03-26T05:47:37+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/656078801_1330074429170480_6400370973605988404_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=-O7_nrbM_ukQ7kNvwEljuYv&_nc_oc=AdqmDRiG_cx-YEQzwfxZrPppOsCMGgnq4wDQoaCiKlJ0QGXQZyY2L8mtiKHaVoaeVZo&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afx9gjqtCWh769VapYnUUEpyS67HfF4DSk2zH1pBJ-HI-w&oe=69CC057E",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/656078801_1330074429170480_6400370973605988404_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=-O7_nrbM_ukQ7kNvwEljuYv&_nc_oc=AdqmDRiG_cx-YEQzwfxZrPppOsCMGgnq4wDQoaCiKlJ0QGXQZyY2L8mtiKHaVoaeVZo&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afx9gjqtCWh769VapYnUUEpyS67HfF4DSk2zH1pBJ-HI-w&oe=69CC057E",
      "comments": {
        "data": [
          {
            "message": "Vâng",
            "id": "1330074489170474_797750622947150"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MQZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1330074489170474"
    },
    {
      "message": "Hiểu rồi hiểu rồi, hòi đó hông hiểu chứ giờ hiểu hết",
      "created_time": "2026-03-26T04:51:48+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/655240310_1330039159174007_1467163679775673534_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=D-dZsTuIuKoQ7kNvwF_C5k9&_nc_oc=Adotc7DFwqHPfWbUSziZSofZTgkw2rH2g8Aiycw4Gia-bKIUB55Eod2RSbksI1GO1hY&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afxv5xL4_wA9AI92bsMLv6nwqWOCLYgEKW28Rb3bmPPyQQ&oe=69CC22F0",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/655240310_1330039159174007_1467163679775673534_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=D-dZsTuIuKoQ7kNvwF_C5k9&_nc_oc=Adotc7DFwqHPfWbUSziZSofZTgkw2rH2g8Aiycw4Gia-bKIUB55Eod2RSbksI1GO1hY&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afxv5xL4_wA9AI92bsMLv6nwqWOCLYgEKW28Rb3bmPPyQQ&oe=69CC22F0",
      "comments": {
        "data": [
          {
            "message": "🍀🍀 Bảo hiểm cược thua ngại gì thử
🍀Hoàn tiền đến 100%
Ngại gì không săn https://fly88.uk",
            "id": "1330039192507337_1261252638845353"
          },
          {
            "message": "🔥🔥Nạp usdt lần đầu thưởng 100/% chỉ có tại cm88 và nhiều trương trình hấp dẫn khác đang chờ đón. Số lượng có hạn https://cm8806.com/cm88khuyenmai",
            "id": "1330039192507337_1298123962275528"
          },
          {
            "message": "https://cm8806.com/cm88khuyenmai
 🎉 Ưu đãi cập nhật hằng ngày – click xem ngay!",
            "id": "1330039192507337_1592318955399995"
          },
          {
            "message": "https://cm8806.com/cm88khuyenmai
 🎉 Ưu đãi cập nhật hằng ngày – click xem ngay!",
            "id": "1330039192507337_956016323775459"
          }
        ],
        "paging": {
          "cursors": {
            "before": "NAZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1330039192507337"
    },
    {
      "message": "Khi Dương Lâm bật mode tổng tài kiểu:

“14 tỷ vi khuẩn ở toilet trong nhà này thật thú vị :)))) Đã đến lúc phải cho tập đoàn này “phá sản” rồi😂😂” #VimXitxitxa #SaThaiViKhuan #Leduongbaolam #hoptaccungUnilever",
      "created_time": "2026-03-26T04:22:31+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/657168969_1330019445842645_2629200650968429988_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=dChE3WFUf7IQ7kNvwGzOn0R&_nc_oc=AdqJfnABCasZneyNeAUTynhoOKMsBB-ABUPrq-jcMKzBwIANNBcrj9ywECqYTHdjxvY&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afxl0U_M2zjnhccY_aZRVK5CbWPb4aF9PvjMhy-jWA8yGQ&oe=69CC0A32",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/657168969_1330019445842645_2629200650968429988_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=dChE3WFUf7IQ7kNvwGzOn0R&_nc_oc=AdqJfnABCasZneyNeAUTynhoOKMsBB-ABUPrq-jcMKzBwIANNBcrj9ywECqYTHdjxvY&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_Afxl0U_M2zjnhccY_aZRVK5CbWPb4aF9PvjMhy-jWA8yGQ&oe=69CC0A32",
      "comments": {
        "data": [
          {
            "message": "Tổng tài Thu Diễm đã ra tay hướng dẫn tiêu diệt vi khuẩn cỡ đó, ảnh cho phép mấy bà dô đây mua hàng sa thải vi khuẩn đó: https://u-shop.vn/n%C6%B0%E1%BB%9Bc-t%E1%BA%A9y-b%E1%BB%93n-c%E1%BA%A7u-v%C3%A0-nh%C3%A0-t%E1%BA%AFm-vim-880ml",
            "id": "1330020072509249_1316274563681911"
          },
          {
            "message": "nhìn mà thấy thỏa mãn ghê 💫, nhất là coi xong nhớ luôn cách vệ sinh toilet luôn, ông này làm content quá cuốn",
            "id": "1330020072509249_1660071788447643"
          },
          {
            "message": "đỉnh thật sự 😂, nhất là cái idea HR tuyển rồi sa thải vi khuẩn quá sáng tạo, chị Diễm đóng vai HR hợp ghê",
            "id": "1330020072509249_2349020468842230"
          },
          {
            "message": "Xem cảnh chị Diễm xử gọn team vi khuẩn – đỉnh thật sự 👍. chị Dĩm nói câu nào dính câu đó.",
            "id": "1330020072509249_831899186598405"
          },
          {
            "message": "Đúng kiểu tổng tài ra tay thật sự… đúng kiểu vừa hài vừa đã 📱… coi xong là muốn dọn nhà liền",
            "id": "1330020072509249_1306317258051967"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MTAxOQZDZD",
            "after": "OTk5"
          }
        }
      },
      "id": "101844588595011_1330020072509249"
    },
    {
      "message": "Khó nói thế nhỉ",
      "created_time": "2026-03-26T03:19:29+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/655503740_1329979429179980_1236266229118367044_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=107&ccb=1-7&_nc_sid=7b2446&_nc_ohc=y3iuLG-StLcQ7kNvwGphuZS&_nc_oc=Adp6pTZ2JuGNHyAb2Xta0caqgRWbVF_E0yFSMGozEIJx1VxKBGCJ5tkPUTZ0dcN378w&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwGkNO1-P3dcc2ld2Ci_P6yBa-Mg3i3eFcDotggiLklyw&oe=69CC1AFD",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/655503740_1329979429179980_1236266229118367044_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=107&ccb=1-7&_nc_sid=7b2446&_nc_ohc=y3iuLG-StLcQ7kNvwGphuZS&_nc_oc=Adp6pTZ2JuGNHyAb2Xta0caqgRWbVF_E0yFSMGozEIJx1VxKBGCJ5tkPUTZ0dcN378w&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwGkNO1-P3dcc2ld2Ci_P6yBa-Mg3i3eFcDotggiLklyw&oe=69CC1AFD",
      "comments": {
        "data": [
          {
            "message": "Y như thay đầu 🤣",
            "id": "1329979505846639_1662912848197320"
          },
          {
            "message": "Vâng",
            "id": "1329979505846639_1232859238959336"
          },
          {
            "message": "Ánh Dương cỡ tao",
            "id": "1329979505846639_1309657537749041"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MwZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1329979505846639"
    },
    {
      "message": "CÓ CON MÀ GẢ CHỒNG GẦN
CHÁY NHÀ MỘT PHÁT NÓ LẦN SANG LUÔN 🙏🏻

Cận cảnh màn giải cứu cả gia đình của ông con rể vụ cháy Lĩnh Nam hôm trước. 

Chính anh Long (con rể) là người xung phong nhảy qua khoảng cách gần 2m từ tầng 7 để cứu bố mẹ vợ. Sau đó các anh thợ xây hợp sức bắc cầu khỉ, kết hợp cùng anh Long giải cứu cả gia đình. Hiện anh Long cũng phải đi viện vì bị bỏng và bị thương vùng lưng 😢

Video: Phạm Văn Hiền",
      "created_time": "2026-03-26T01:11:39+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t15.5256-10/658417303_912886458386817_2407341921655468849_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=105&ccb=1-7&_nc_sid=5fad0e&_nc_ohc=f2KHim77fGcQ7kNvwGrp-cZ&_nc_oc=AdoLypojIAl8_h4EyumupvfHKq53mszBdlW0Ry2mZhZAhLEqwxDgSMAaEymHbeeltug&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfzSa8Df4dExMcAdnrnVe1-YRt8OqJWUBiQ_epliJf1hjQ&oe=69CC2F89",
                "width": 405
              },
              "source": "https://scontent.fbmv1-1.fna.fbcdn.net/o1/v/t2/f2/m366/AQNZNJTXXznp6iF7UvVVakGLm5SxWvLutuPkglfR9-PBwn2ozeLAeJ5d0NEoW0LgviCTzAjLzXJbg8U6oszxfFmRpvCyTgIBTZECI1HgEpwaWw.mp4?_nc_cat=108&_nc_oc=AdqiXTWn-2vbF8Ft__ayOT6znHGNdgaLxKS8YUGkrJ-6oTVAlT809V5PqxEnjRKsLFg&_nc_sid=5e9851&_nc_ht=scontent.fbmv1-1.fna.fbcdn.net&_nc_ohc=L2sJTt7wLPYQ7kNvwEAGfVi&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuNzIwLmRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHAiLCJ4cHZfYXNzZXRfaWQiOjk3NjU2NTYzMTcxMDYyNSwiYXNzZXRfYWdlX2RheXMiOjEsInZpX3VzZWNhc2VfaWQiOjEwMTIyLCJkdXJhdGlvbl9zIjoxNDgsInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=f71276d5f52a7801&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9CRjQyRkUxNUQ3NDFBNkNBMUUxNzk2NjUxMTZEOTI5RF9tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50L0RENEQ5QzVEMUNBMjhEMDk3NTY0RjczQkI0OTAxM0E2X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACbC1p_5zIu8AxUCKAJDMywXQGKVT987ZFoYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZSeAQA&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&_nc_zt=28&oh=00_Afy3EpSGRPa_ydaqY15LB4MlWNQjMhRe3Y6pRmnRFdd1IQ&oe=69CC2824&bitrate=1344626&tag=dash_h264-basic-gen2_720p"
            },
            "media_type": "video"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t15.5256-10/658417303_912886458386817_2407341921655468849_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=5fad0e&_nc_ohc=f2KHim77fGcQ7kNvwGrp-cZ&_nc_oc=AdoLypojIAl8_h4EyumupvfHKq53mszBdlW0Ry2mZhZAhLEqwxDgSMAaEymHbeeltug&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfxzM_NN5Fpo4ob4ndyQZh8trHebMdxaK6obMUPTtR0b0g&oe=69CC2F89",
      "comments": {
        "data": [
          {
            "message": "Người hùng đâu xa, ở xung quanh ta",
            "id": "1329891802522076_1469249534800960"
          },
          {
            "message": "A di đà phật cầu cho mọi người đc bình an",
            "id": "1329891802522076_839084765896164"
          },
          {
            "message": "Quá tuyệt vời luôn ý anh em bà con lối xóm rất nhiệt tình",
            "id": "1329891802522076_2089867451793508"
          },
          {
            "message": "❤️",
            "id": "1329891802522076_1434290608433796"
          },
          {
            "message": "",
            "id": "1329891802522076_1291236839592676"
          }
        ],
        "paging": {
          "cursors": {
            "before": "NQZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1329891802522076"
    },
    {
      "message": "Giải cứu thành công bé trai 10 tuổi mắc kẹt giữa hai bức tường

Trong suốt quá trình cứu hộ, lực lượng chức năng không ngừng gọi tên, trấn an để bé giữ bình tĩnh giữa không gian chật hẹp và đầy hoảng loạn. Từng chút một, họ tìm cách tiếp cận, đồng thời luồn ống dây dài để truyền nước, giúp bé duy trì sức khỏe.

Đến 10 giờ 40 phút, chưa đầy 30 phút kể từ khi triển khai phương án, phép màu đã xảy ra. Bé trai được đưa ra ngoài trong sự vỡ òa của tất cả mọi người. 

Video: Thời sự VTV",
      "created_time": "2026-03-25T15:38:30+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t15.5256-10/658970614_1415791719852317_7412974517594998550_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=110&ccb=1-7&_nc_sid=5fad0e&_nc_ohc=tIs2iEB9XoYQ7kNvwHw6Fg2&_nc_oc=Ado4-a3t7a8Wo9Yvkh8UL_kJ9NJ-LNR74g-vKzVLp5mAQA2Xab9Cqr2KyXFbe6BjL9c&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfyNwOBW5w56onLFvVDhczEmo1p39PYlTXOUOBcqXDOHng&oe=69CC0B82",
                "width": 405
              },
              "source": "https://scontent.fbmv1-1.fna.fbcdn.net/o1/v/t2/f2/m366/AQMY-4R_VZI50qYKL5TSFdPM9kT6vwnq-W856VEEJx6PS8JqXmFxvVrKLB9ssc0gm63qQYLWAepuv-b1b1q5aZyA26gLgpSPqi3rH7-9dXw_Xg.mp4?_nc_cat=104&_nc_oc=Ado7rAe2zSP7A2ero44rlK0vGjz896Esv4VWXXAGYiGcpsVVHsHTGKiDQQx-HnTMeEE&_nc_sid=5e9851&_nc_ht=scontent.fbmv1-1.fna.fbcdn.net&_nc_ohc=8dyFZhaAdu4Q7kNvwGafrGT&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuNzIwLmRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHAiLCJ4cHZfYXNzZXRfaWQiOjY4MjY4NTIwMTYwMzA5NiwiYXNzZXRfYWdlX2RheXMiOjEsInZpX3VzZWNhc2VfaWQiOjEwMTIyLCJkdXJhdGlvbl9zIjozMywidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&vs=f109abb8c259480e&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC8zRjRBMTIzQUE0ODJBNzlDRjUwNTAxRDc0NzVCQjI4NV9tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50L0I0NDMxOTEyRTVBMUE2QTI3NkZENjE2N0M2OURDODg0X2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACaw6PqOwbm2AhUCKAJDMywXQECd0vGp--cYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZSeAQA&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a3a8&_nc_zt=28&oh=00_Afy5HR0xhffcGk9xck5frRk0iq95IVHFG3vPxhTEQ_LzVQ&oe=69CC00C0&bitrate=1745437&tag=dash_h264-basic-gen2_720p"
            },
            "media_type": "video"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t15.5256-10/658970614_1415791719852317_7412974517594998550_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=5fad0e&_nc_ohc=tIs2iEB9XoYQ7kNvwHw6Fg2&_nc_oc=Ado4-a3t7a8Wo9Yvkh8UL_kJ9NJ-LNR74g-vKzVLp5mAQA2Xab9Cqr2KyXFbe6BjL9c&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfyuFFpYdI2bnSSIQD_AcfCzYhWnpxIa-7fc0JvFJbGdqw&oe=69CC0B82",
      "comments": {
        "data": [
          {
            "message": "cú sốc đầu đời =))))))",
            "id": "1329562122555044_1653937675608696"
          },
          {
            "message": "Ai nói đầu xui đuôi lọt đâu. Hahaha. Không hề lọt ^^!",
            "id": "1329562122555044_2109119546320064"
          },
          {
            "message": "Quá may mắn cho bé. Khi nào khoẻ lại thì có roi mây đang chờ 😂",
            "id": "1329562122555044_1739494973682537"
          },
          {
            "message": "Này là chơi bắt trốn chứ đâu, trốn chỗ nguy hiểm nhất là chỗ an toàn nhất, xong dính trỏng lun vừa thương vừa buồn cười ông nhỏ🤣🤣🤣🤣🤣🤣",
            "id": "1329562122555044_2121197748723090"
          },
          {
            "message": "Tran Tram sao nó zô đó đc zạ?🥹",
            "id": "1329562122555044_2112583369580838"
          },
          {
            "message": "Ngày xưa ở trường 2 dãy nhà cũng có đường lách kiểu như này mà dài phải tầm 7m ,đi tắt qua lách người đi ngang sát nịt ,nghĩ lại cũng ghê",
            "id": "1329562122555044_1565748164501822"
          },
          {
            "message": "Lúc này thì xót thật, chớ tối về là ăn roi nhé bae",
            "id": "1329562122555044_1206789041376597"
          },
          {
            "message": "Duy Khánh còn bé mà thích lọt khe :)))",
            "id": "1329562122555044_923481393985895"
          },
          {
            "message": "Chui sao hay vậy :))?",
            "id": "1329562122555044_1249998703930953"
          },
          {
            "message": "Được công an dẫn đi về kêu lũ bạn oai liền",
            "id": "1329562122555044_969511399363184"
          },
          {
            "message": "thương con",
            "id": "1329562122555044_1497147078737079"
          },
          {
            "message": "Mẹ và cây roi đang chờ",
            "id": "1329562122555044_3270851169761653"
          },
          {
            "message": "Rồi chui vô đó chi z",
            "id": "1329562122555044_4165769306900012"
          },
          {
            "message": "Lì =))",
            "id": "1329562122555044_1982065223189901"
          },
          {
            "message": "C Thanh Thảo 🤣🤣 ma giấu chắc luôn 😂😂😂",
            "id": "1329562122555044_1470524544794158"
          },
          {
            "message": "Khổ thân",
            "id": "1329562122555044_1250068236729903"
          },
          {
            "message": "chơi ngu lấy tiếng luôn :)))",
            "id": "1329562122555044_928864166784338"
          },
          {
            "message": "Mẹ=)) lậy bố",
            "id": "1329562122555044_1270801178533587"
          },
          {
            "message": "",
            "id": "1329562122555044_2002806904453621"
          },
          {
            "message": "Nguyễn Thị Thùy Dương chui dô trỏng chi dị",
            "id": "1329562122555044_944260178087734"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MjgZD",
            "after": "OQZDZD"
          },
          "next": "https://graph.facebook.com/v24.0/101844588595011_1329562122555044/comments?access_token=EAABsbCS1iHgBRObZBU3pvSzqsmL81lMy2qCEKgLzuro7Oti6NZBS9To5FwvpivEW0EkMsJpd69q63rTv9r7Vwi2AbloRkZC2eaZAdB1nd0TpLpfWbMsSorq2bDAn73eGh5TpZBaQVDzPKMWEOiPYz1L2rqKmEKzlQ19x6NCccNnd9VN27f6aNCrsS24suu9dpmkoNkUYqN14FlAZDZD&pretty=0&fields=message&limit=20&after=OQZDZD"
        }
      },
      "id": "101844588595011_1329562122555044"
    },
    {
      "message": "Khoảnh khắc Thủ tướng Phạm Minh Chính gặp gỡ Tổng thống Vladimir Putin và trao nhau cái ôm thắm thiết tại Điện Kremlin 🇷🇺🇻🇳",
      "created_time": "2026-03-25T14:50:30+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 394,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t15.5256-10/657444278_2067175190520641_810468150282722581_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=111&ccb=1-7&_nc_sid=5fad0e&_nc_ohc=t9EX1a9zaKAQ7kNvwEtXt6P&_nc_oc=Adpz3pwC5lgbUvTqZgSipewWtPCyKf3RpwmdKRJXs_ztpaa4PobxvS0Q9Y0o2ODQp80&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfyzDHNduwRt2XFGBV9bcik1MCYcVZniaSD8ITWVCG1aVA&oe=69CC1B3C",
                "width": 720
              },
              "source": "https://scontent.fbmv1-1.fna.fbcdn.net/o1/v/t2/f2/m366/AQNeLdI1zgVlTRQoo0UC3BM1aJKcBHStOPXh-4vn0n2m1qUc7T0h19HLX7KwMDbvt_A_G5IV_WuFet2aXnrwQyRWJQRojPOEa-IXG77roRzMQw.mp4?_nc_cat=111&_nc_oc=Adon9BZcszwpDcazAgNQ9JOr616MA0NwKrwbKYqtO3wwTCW5iUjY2aboPbVSkKffmO4&_nc_sid=5e9851&_nc_ht=scontent.fbmv1-1.fna.fbcdn.net&_nc_ohc=mOV1zKoBEKUQ7kNvwFcF4Xn&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuODU2LmRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHAiLCJ4cHZfYXNzZXRfaWQiOjk5MTk4MDY0NjczMDY0NywiYXNzZXRfYWdlX2RheXMiOjEsInZpX3VzZWNhc2VfaWQiOjEwMTIyLCJkdXJhdGlvbl9zIjoxMSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&vs=1e630859fe786926&_nc_vs=HBksFQIYRWZiX2VwaGVtZXJhbC9GNjQ5NEFFQTdBMEQwMTI0OTJCMUMyQ0M1MjA2RjRBNl9tdF8xX3ZpZGVvX2Rhc2hpbml0Lm1wNBUAAsgBEgAVAhhAZmJfcGVybWFuZW50L0I0NDRGOEJCMTVFRTc1MjREQ0EyMEMwREY4RTg2RDlDX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACaurpTh74zDAxUCKAJDMywXQCYQ5WBBiTcYGWRhc2hfaDI2NC1iYXNpYy1nZW4yXzcyMHARAHUCZZSeAQA&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&_nc_zt=28&oh=00_AfxwVoo7trzxp5sgbsm25UES23-c8aw1QuKJ2fpo9U5pjw&oe=69CC1715&bitrate=572744&tag=dash_h264-basic-gen2_720p"
            },
            "media_type": "video"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t15.5256-10/657444278_2067175190520641_810468150282722581_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=5fad0e&_nc_ohc=t9EX1a9zaKAQ7kNvwEtXt6P&_nc_oc=Adpz3pwC5lgbUvTqZgSipewWtPCyKf3RpwmdKRJXs_ztpaa4PobxvS0Q9Y0o2ODQp80&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwaNt_ODXXnMPKTD8e0P9QH1ueOlwlGxivb-TGUCQrr3Q&oe=69CC1B3C",
      "id": "101844588595011_1329530975891492"
    },
    {
      "message": "Anh ấy là sinh viên loại giỏi 🔥

Nguyễn Lê Tú, sinh viên năm thứ hai ngành Vật lý kỹ thuật nhận giấy khen, quà động viên từ Đại học Bách khoa Hà Nội, sau khi hỗ trợ cứu 7 người mắc kẹt trong căn nhà cháy.",
      "created_time": "2026-03-25T14:23:59+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658079619_1329513875893202_5717942027759503766_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=immTktADHOgQ7kNvwHMv7Va&_nc_oc=Adohp3klPLdieRIgyyaWKsn1SQ6rbKQ35q1zjKUPZZJX9STXwGTB7kUp1Z3LNyO562U&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfzaogRCdua-V-aad_vCCEOFM3d-1DPwxPEGQAfP-Uddyw&oe=69CC18C4",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658079619_1329513875893202_5717942027759503766_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=105&ccb=1-7&_nc_sid=7b2446&_nc_ohc=immTktADHOgQ7kNvwHMv7Va&_nc_oc=Adohp3klPLdieRIgyyaWKsn1SQ6rbKQ35q1zjKUPZZJX9STXwGTB7kUp1Z3LNyO562U&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfzaogRCdua-V-aad_vCCEOFM3d-1DPwxPEGQAfP-Uddyw&oe=69CC18C4",
      "comments": {
        "data": [
          {
            "message": "🥰 Em í là Le Tu á m, n",
            "id": "1329513899226533_1263289488649435"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MQZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1329513899226533"
    },
    {
      "message": "Cách người giàu PR bài mới: TRAO GIẢI COVER LÀ 100L XĂNG :))))",
      "created_time": "2026-03-25T14:04:39+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658144971_1329499345894655_4568587805287238203_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=111&ccb=1-7&_nc_sid=7b2446&_nc_ohc=oZVyQYKp494Q7kNvwGH7kqi&_nc_oc=AdpiRHCMLTcqSbxeQugNkOqJqeG4_e4ekVVqfuvMYYkUaaYZ9hBGnC9I7vpOi6-RunE&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwZ1PdqwP2iSoU9Qo3ikFfwuhLopR72mOPpsTDcORq8Jg&oe=69CC1884",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658144971_1329499345894655_4568587805287238203_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=111&ccb=1-7&_nc_sid=7b2446&_nc_ohc=oZVyQYKp494Q7kNvwGH7kqi&_nc_oc=AdpiRHCMLTcqSbxeQugNkOqJqeG4_e4ekVVqfuvMYYkUaaYZ9hBGnC9I7vpOi6-RunE&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwZ1PdqwP2iSoU9Qo3ikFfwuhLopR72mOPpsTDcORq8Jg&oe=69CC1884",
      "comments": {
        "data": [
          {
            "message": "Nghệ sĩ nước mình ơi :))))",
            "id": "1329499372561319_939330572180187"
          },
          {
            "message": "Phuoc Sang lụm giải nhất đi",
            "id": "1329499372561319_2379442302570065"
          },
          {
            "message": "Ủa ai z mng",
            "id": "1329499372561319_1496123548782431"
          },
          {
            "message": "Hoàng Trinh",
            "id": "1329499372561319_1462112418628893"
          },
          {
            "message": "Ngọc Dung ê=))))))",
            "id": "1329499372561319_26490293420657895"
          },
          {
            "message": "Lý Liên Kiệt",
            "id": "1329499372561319_1632954321346495"
          },
          {
            "message": "Thiên Dịu",
            "id": "1329499372561319_1639746250672018"
          },
          {
            "message": "Bảo An",
            "id": "1329499372561319_907683508842802"
          },
          {
            "message": "Minh Anh",
            "id": "1329499372561319_1080761711780707"
          },
          {
            "message": "Tuệ Mẫn Trân Kiều Lê",
            "id": "1329499372561319_1847404189228968"
          },
          {
            "message": "Hue Anh 100 lít xăng kìa",
            "id": "1329499372561319_1666370731367390"
          },
          {
            "message": "Đu đỉnh xăng 40",
            "id": "1329499372561319_2059080637997330"
          },
          {
            "message": "Nhậc MỹNguyên Lãng hát ngay",
            "id": "1329499372561319_969950595608307"
          },
          {
            "message": "Chương Nguyên lets go",
            "id": "1329499372561319_1475581140648306"
          },
          {
            "message": "Đào Đào thấy bà hay cover nè cover đi haha",
            "id": "1329499372561319_1462753582179040"
          },
          {
            "message": "🍀🍀 Bảo hiểm cược thua ngại gì thử
🍀Hoàn tiền đến 100%
Ngại gì không săn https://fly88.uk",
            "id": "1329499372561319_2144778349452768"
          },
          {
            "message": "https://fly88.uk
💥 ɴạᴘ đầᴜ x𝟸 𝟷𝟶𝟶%  
🎁 ɴʜậɴ ɴɢᴀʏ – ᴄʜơɪ ʟɪềɴ ᴛᴀʏ  
🚀 ᴠàᴏ ʟà ᴄó ǫᴜà!  
⏳ ɴʜᴀɴʜ ᴛᴀʏ ᴋẻᴏ ʟỡ!",
            "id": "1329499372561319_918074767526893"
          },
          {
            "message": "https://cm8806.com/cm88khuyenmai
 🔥 Nhiều phần thưởng hấp dẫn đang đợi bạn!",
            "id": "1329499372561319_2034558423789513"
          },
          {
            "message": "https://cm8806.com/cm88khuyenmai
 🔥 Nhiều phần thưởng hấp dẫn đang đợi bạn!",
            "id": "1329499372561319_1261511978807877"
          },
          {
            "message": "🔥🔥Nạp usdt lần đầu thưởng 100/% chỉ có tại cm88 và nhiều trương trình hấp dẫn khác đang chờ đón. Số lượng có hạn https://cm8806.com/cm88khuyenmai",
            "id": "1329499372561319_910798948486076"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MzUZD",
            "after": "MTUZD"
          },
          "next": "https://graph.facebook.com/v24.0/101844588595011_1329499372561319/comments?access_token=EAABsbCS1iHgBRObZBU3pvSzqsmL81lMy2qCEKgLzuro7Oti6NZBS9To5FwvpivEW0EkMsJpd69q63rTv9r7Vwi2AbloRkZC2eaZAdB1nd0TpLpfWbMsSorq2bDAn73eGh5TpZBaQVDzPKMWEOiPYz1L2rqKmEKzlQ19x6NCccNnd9VN27f6aNCrsS24suu9dpmkoNkUYqN14FlAZDZD&pretty=0&fields=message&limit=20&after=MTUZD"
        }
      },
      "id": "101844588595011_1329499372561319"
    },
    {
      "message": "Thanh Hóa: Người phụ nữ mang 7 mẫu ADN của 7 người đàn ông khác nhau đi xét nghiệm mới tìm được đúng bố cho đứa con trong bụng mình",
      "created_time": "2026-03-25T12:07:44+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/657498453_1329406042570652_2368020168664350752_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=My5OthVah9MQ7kNvwFy83TM&_nc_oc=Adq907zZWduwEtxm1CPZ6xdroJx4FSmU5XRf_CEQZUsbII4VoX1cs4LT5pURSwqVPDo&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwQhw85hcuZyOev62tEdPnWqKWmM-wuzjhMI6hWsYgOhw&oe=69CC2126",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/657498453_1329406042570652_2368020168664350752_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=My5OthVah9MQ7kNvwFy83TM&_nc_oc=Adq907zZWduwEtxm1CPZ6xdroJx4FSmU5XRf_CEQZUsbII4VoX1cs4LT5pURSwqVPDo&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwQhw85hcuZyOev62tEdPnWqKWmM-wuzjhMI6hWsYgOhw&oe=69CC2126",
      "comments": {
        "data": [
          {
            "message": "Biết xác định Tập Mẫu là giỏi rồi, thử phần tử trong mẫu thế nào chả trúng 😂",
            "id": "1329419522569304_963803246172451"
          },
          {
            "message": "Chúc mừng bố cháu",
            "id": "1329419522569304_1487929839700356"
          },
          {
            "message": "7 cháu thôi á???",
            "id": "1329419522569304_2246730519471774"
          },
          {
            "message": "Hả",
            "id": "1329419522569304_1612741979939741"
          }
        ],
        "paging": {
          "cursors": {
            "before": "NAZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1329419522569304"
    },
    {
      "message": "Em trai này là Nguyễn Lê Tú (2k6) là sinh viên ĐH Bách khoa Hà Nội. Vừa đi tập gym về ngang qua ngôi nhà đang cháy em liền lao vào hỗ trợ. Em chạy lên tầng thượng ngôi nhà đang xây kế bên, cùng mọi người giữ thang để đưa 2 người lớn tuổi thoát nạn.

Cực kì biểu dương tinh thần dũng cảm, không quản ngại hiểm nguy của Tú. Không phải ai cũng đủ can đảm có những hành động dũng cảm như em.",
      "created_time": "2026-03-25T12:01:34+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/655167958_1329415519236371_240211402650104641_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=104&ccb=1-7&_nc_sid=7b2446&_nc_ohc=2q8nvmwC7QcQ7kNvwGSRup1&_nc_oc=AdpGNZvVSiNehi5x5xJphwVJl8aConMHPjCcTp27v13rfaHQ-0pCiLJFHRUH23IQlj4&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfyjZKv2r-CXcobzrU28iS-9HXQmG1EoLRDW6AcmiWNk8g&oe=69CC1036",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/655167958_1329415519236371_240211402650104641_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=104&ccb=1-7&_nc_sid=7b2446&_nc_ohc=2q8nvmwC7QcQ7kNvwGSRup1&_nc_oc=AdpGNZvVSiNehi5x5xJphwVJl8aConMHPjCcTp27v13rfaHQ-0pCiLJFHRUH23IQlj4&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfyjZKv2r-CXcobzrU28iS-9HXQmG1EoLRDW6AcmiWNk8g&oe=69CC1036",
      "comments": {
        "data": [
          {
            "message": "Đẹp người còn đẹp nết nữa chứ lại còn Bách Khoa .",
            "id": "1329415569236366_991403563557750"
          },
          {
            "message": "Anh hùng thời nào cũng có 🥰",
            "id": "1329415569236366_1134587252117190"
          },
          {
            "message": "Em trai nghĩ lại may k tập chân bửa đấy",
            "id": "1329415569236366_1932366187377466"
          },
          {
            "message": "Thanh Phương cộng 100 điểm rèn luyện ngay",
            "id": "1329415569236366_778820584988938"
          },
          {
            "message": "lời nói dối lớn nhất năm là j, con ổn mà",
            "id": "1329415569236366_947571924443368"
          },
          {
            "message": "Lợi ích của tập gym :))",
            "id": "1329415569236366_912248891630803"
          },
          {
            "message": "Em trai nào?? Ck mà :))",
            "id": "1329415569236366_925782067010830"
          },
          {
            "message": "Hương Hoa có thể là rỉ lâu dài",
            "id": "1329415569236366_1890923111538315"
          },
          {
            "message": "Khác gì spiderman đâu",
            "id": "1329415569236366_954709317019970"
          },
          {
            "message": "Vừa đẹp trai vừa giỏi vừa tốt bụng nữa tui thấy người đàn ông tuyệt vời ở e trai rồi hihi",
            "id": "1329415569236366_1240789581496010"
          },
          {
            "message": "",
            "id": "1329415569236366_928060143481344"
          },
          {
            "message": "🍀🍀 Bảo hiểm cược thua ngại gì thử
🍀Hoàn tiền đến 100%
Ngại gì không săn https://fly88.uk",
            "id": "1329415569236366_1322729119902265"
          },
          {
            "message": "\"Đã bảo em không phải người hùng mà cứ tung hô.\"
Giờ mẹ em biết hết rồi, khổ quá",
            "id": "1329415569236366_922246933861923"
          },
          {
            "message": "https://fly88.uk
💥 ɴạᴘ đầᴜ x𝟸 𝟷𝟶𝟶%  
🎁 ɴʜậɴ ɴɢᴀʏ – ᴄʜơɪ ʟɪềɴ ᴛᴀʏ  
🚀 ᴠàᴏ ʟà ᴄó ǫᴜà!  
⏳ ɴʜᴀɴʜ ᴛᴀʏ ᴋẻᴏ ʟỡ!",
            "id": "1329415569236366_893988083614822"
          },
          {
            "message": "https://cm8806.com/cm88khuyenmai
 🌸 Ưu đãi nhẹ nhàng – quà cực sang!",
            "id": "1329415569236366_936519792576877"
          },
          {
            "message": "🔥🔥Nạp usdt lần đầu thưởng 100/% chỉ có tại cm88 và nhiều trương trình hấp dẫn khác đang chờ đón. Số lượng có hạn https://cm8806.com/cm88khuyenmai",
            "id": "1329415569236366_3872140102922734"
          },
          {
            "message": "Cảm ơn người hùng ♥️",
            "id": "1329415569236366_920840970731523"
          },
          {
            "message": "Respect",
            "id": "1329415569236366_1251995723756362"
          }
        ],
        "paging": {
          "cursors": {
            "before": "NDcZD",
            "after": "MjUZD"
          }
        }
      },
      "id": "101844588595011_1329415569236366"
    },
    {
      "message": "Cầu được ước thấy, ông trời quá ưu ái cho bả ròi 😁",
      "created_time": "2026-03-25T11:37:04+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 720,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658363633_1329399442571312_8499308187762580763_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=QyZlv3-qDwMQ7kNvwFz_TA0&_nc_oc=AdouUKn5zQShxa5iaRFlIlc3lnj8hVdDJTtaZwKAx8vyeR5kxwtEsqo_ZVUQ2xwcBek&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwjIEyk1RbzlrXYKxJ6XnNJk1JOQT1gJ7WPwRF6h6TsmQ&oe=69CC0BCF",
                "width": 720
              }
            },
            "media_type": "photo"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/658363633_1329399442571312_8499308187762580763_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=100&ccb=1-7&_nc_sid=7b2446&_nc_ohc=QyZlv3-qDwMQ7kNvwFz_TA0&_nc_oc=AdouUKn5zQShxa5iaRFlIlc3lnj8hVdDJTtaZwKAx8vyeR5kxwtEsqo_ZVUQ2xwcBek&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwjIEyk1RbzlrXYKxJ6XnNJk1JOQT1gJ7WPwRF6h6TsmQ&oe=69CC0BCF",
      "comments": {
        "data": [
          {
            "message": "Có r còn :)",
            "id": "1329399479237975_1656797962437601"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MQZDZD",
            "after": "MQZDZD"
          }
        }
      },
      "id": "101844588595011_1329399479237975"
    },
    {
      "message": "Nguyễn Lê Tú (20 tuổi, sinh viên Đại học Bách khoa Hà Nội) - 1 trong những người lao vào biển lửa cứu người trong vụ cháy tại Lĩnh Nam hôm qua ♥️

Sáng nay, Tú chỉ dám gửi ảnh và nói với mẹ rằng anh bị ngã. \"Tôi không dám nói mình lao vào đám cháy, sợ mẹ lo lắng\", nam sinh chia sẻ.",
      "created_time": "2026-03-25T07:58:57+0000",
      "attachments": {
        "data": [
          {
            "media": {
              "image": {
                "height": 1080,
                "src": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/656716001_1329270159250907_2492110801224314333_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=7b2446&_nc_ohc=fQKLE7EdVRwQ7kNvwFy2Esf&_nc_oc=Ado6UkdbwZBWam2tl5ptR-Cjg0qZXQq0ag544I7i4GnhCRYsJxv-NKybjxAQg7lDt88&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwbDdiN14wViEShU_yuJJA3BhxkrGiCGNxpLUYAsaF6aw&oe=69CC1478",
                "width": 699
              }
            },
            "media_type": "album"
          }
        ]
      },
      "full_picture": "https://scontent.fbmv1-1.fna.fbcdn.net/v/t39.30808-6/656716001_1329270159250907_2492110801224314333_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=7b2446&_nc_ohc=fQKLE7EdVRwQ7kNvwFy2Esf&_nc_oc=Ado6UkdbwZBWam2tl5ptR-Cjg0qZXQq0ag544I7i4GnhCRYsJxv-NKybjxAQg7lDt88&_nc_zt=23&_nc_ht=scontent.fbmv1-1.fna&_nc_gid=OaDyT1Iv5barA4D20DXY3Q&_nc_ss=7a32e&oh=00_AfwbDdiN14wViEShU_yuJJA3BhxkrGiCGNxpLUYAsaF6aw&oe=69CC1478",
      "comments": {
        "data": [
          {
            "message": "Đã ngta giấu mẹ rồi giờ đăng lên =)))",
            "id": "1329270102584246_26382079218089993"
          },
          {
            "message": "Thật ngưỡng mộ..Anh hùng là đây",
            "id": "1329270102584246_1730854811610792"
          },
          {
            "message": "vibe nam chính trong phim đây r",
            "id": "1329270102584246_2858690747806583"
          },
          {
            "message": "Đức tốt của con người được thể hiện qua hành động ❤",
            "id": "1329270102584246_1631252094746686"
          },
          {
            "message": "🃏 Bạn có muốn xem điều gì bạn chưa nhận ra về bản thân không?",
            "id": "1329270102584246_1291882646151242"
          },
          {
            "message": "Đặng Thúy Vy",
            "id": "1329270102584246_2301350006937140"
          },
          {
            "message": "Nguyễn Như",
            "id": "1329270102584246_943133324866343"
          },
          {
            "message": "",
            "id": "1329270102584246_1016922684842454"
          },
          {
            "message": "Vũ Như Quỳnh",
            "id": "1329270102584246_854810387615131"
          },
          {
            "message": "Phương Vy",
            "id": "1329270102584246_1267495292002668"
          },
          {
            "message": "🍀🍀 Bảo hiểm cược thua ngại gì thử
🍀Hoàn tiền đến 100%
Ngại gì không săn https://fly88.uk",
            "id": "1329270102584246_2107617326684147"
          },
          {
            "message": "https://cm8806.com/cm88khuyenmai
 🌻 Tham gia ngay để không lỡ ưu đãi hôm nay!",
            "id": "1329270102584246_1568376970931455"
          },
          {
            "message": "https://cm8806.com/cm88khuyenmai
 🌻 Tham gia ngay để không lỡ ưu đãi hôm nay!",
            "id": "1329270102584246_1534664641694524"
          },
          {
            "message": "🔥🔥Nạp usdt lần đầu thưởng 100/% chỉ có tại cm88 và nhiều trương trình hấp dẫn khác đang chờ đón. Số lượng có hạn https://cm8806.com/cm88khuyenmai",
            "id": "1329270102584246_3196589343856403"
          },
          {
            "message": "",
            "id": "1329270102584246_4306777866265310"
          },
          {
            "message": "Nguyen Quynh Anh ở Lĩnh Nam nè",
            "id": "1329270102584246_960615513062206"
          },
          {
            "message": "Diễm Mơ bạch nguyệt quang",
            "id": "1329270102584246_2804524916559482"
          },
          {
            "message": "🥰 Em í là Le Tu á m, n",
            "id": "1329270102584246_999293875862565"
          },
          {
            "message": "🥰 Em í là Trọng Lâm",
            "id": "1329270102584246_1118140567110950"
          }
        ],
        "paging": {
          "cursors": {
            "before": "MzQZD",
            "after": "MTQZD"
          }
        }
      },
      "id": "101844588595011_1329270102584246"
    }
  ],
  "paging": {
    "cursors": {
      "before": "QVFIU3U0VUFrNkJCWG05UlZAkeVZAtYmRlMXpoSFlIY0VhOXpSeGtxX3pxV3pQbHNaUm9WTkhkY25MQXdLVzV4TjZAuQXdvNDBaMm9UZAWplS01DTkpHNFFMbHhpTnNfT2xSOUR0R2hjYUxtaFQ2X3Utc296YmhQZA0lPM21zbWQ4VV9nUnlnakxjSUZAmUkN3SWtuV0ZAJbDJlOXBHMUl0SDNETFZAsSlAzUXVZAd3J1RFYtNm5JSHR3MWYtYUJpZAGFqN253OVBYSGhiYnJKTWcyY3dKMzJPeEhWMDNPcmx5N21rR284NDF6Vm1NbTVMV0ZAieUxBYTdyVzVqZAzNjaGhsUzVJRGZASNjg1aDM4OTRTbXBMNXVLMVo1a1JDRVhyRDdjeEFvSFI0UjBzNDJJWGhabk1NMkgxRHdDdDBPT0NCRGlYUHhsNmJkZAW8yVjgzU3dFQldzOUh4czNrRi1HY1FxNnhpZAGlCMGVsMk1sNjhqMXdhRVo3UW8wRjhWaVJFeGtvUVEtUmh1Uk5qT1lhR0JlRjhUc3V3TERVVklxdXlTRlR3bnJpeGRLN3d0eVNzak14c3l1RnRTQWkwNjJiWE0xNXVBY3lhTFF4cjlIZAnRzM0VfZA1IwTENUZAWZAVMklR",
      "after": "QVFIU3hLakhIcm5UdERpTWZANQTViRS1GSldmN29SX1RzbEhIUHc1dFFzSDBkcEZATaE80Q0hrTy02eWhFXy1adThIeldwYjdTRVVfaV9RUkQzc2RHS0xLS05kSHlaaDAxaFpmaDFrU2RMY200NEo4WEZAEd0VxeGdDUnFvMDFjNjhZAWlJvMGR6TTNYWFlPeFJSRjRtSXBLRXNfdmhnZAnVhRE00YWZAFU04zUjB5ay1RMnI1ZAW9qb2ZAISzRMVTNSa1RpRW95bVJudUk5TGFIUmxsM182dXpwZAzB2TjRfZAVl2MzJoNWVzS3R1YlVFQ1E0VGF6Qm10ZAi1lci1RQm45X21tc09RdUhzVlVKbmhpRDh0cmVJTEF6ZAkpJVVNaYnctMlRqZAjZAkMnpkR0xvZAy1YVHpmRGxweEJQWV9zVVRCRHNvaUxNZA3d2SVpVRzFaVEotbUFnMzBwNXJfMHQ5SHBaSGU4RE9TZAlpXOXRqY1JPZAWlkcGl2eDdmR3VYdTd6M1l5WHNZAOGNpcFZAFNW1QOWN2aUFPRURjYkoxLXVvSjczMU9wMzdsUUdpWmxtYWRKTGJucGt6OXhITnFNN0tJU28zazc3ZAWFrazRoX0J2Wk9kYVBRMURDakhURWhza3d3"
    },
    "next": "https://graph.facebook.com/v24.0/101844588595011/posts?access_token=EAABsbCS1iHgBRObZBU3pvSzqsmL81lMy2qCEKgLzuro7Oti6NZBS9To5FwvpivEW0EkMsJpd69q63rTv9r7Vwi2AbloRkZC2eaZAdB1nd0TpLpfWbMsSorq2bDAn73eGh5TpZBaQVDzPKMWEOiPYz1L2rqKmEKzlQ19x6NCccNnd9VN27f6aNCrsS24suu9dpmkoNkUYqN14FlAZDZD&fields=message%2Ccreated_time%2Cattachments%7Bmedia%2Cmedia_type%7D%2Cfull_picture%2Ccomments.limit(20)%7Bmessage%7D&pretty=0&limit=25&after=QVFIU3hLakhIcm5UdERpTWZANQTViRS1GSldmN29SX1RzbEhIUHc1dFFzSDBkcEZATaE80Q0hrTy02eWhFXy1adThIeldwYjdTRVVfaV9RUkQzc2RHS0xLS05kSHlaaDAxaFpmaDFrU2RMY200NEo4WEZAEd0VxeGdDUnFvMDFjNjhZAWlJvMGR6TTNYWFlPeFJSRjRtSXBLRXNfdmhnZAnVhRE00YWZAFU04zUjB5ay1RMnI1ZAW9qb2ZAISzRMVTNSa1RpRW95bVJudUk5TGFIUmxsM182dXpwZAzB2TjRfZAVl2MzJoNWVzS3R1YlVFQ1E0VGF6Qm10ZAi1lci1RQm45X21tc09RdUhzVlVKbmhpRDh0cmVJTEF6ZAkpJVVNaYnctMlRqZAjZAkMnpkR0xvZAy1YVHpmRGxweEJQWV9zVVRCRHNvaUxNZA3d2SVpVRzFaVEotbUFnMzBwNXJfMHQ5SHBaSGU4RE9TZAlpXOXRqY1JPZAWlkcGl2eDdmR3VYdTd6M1l5WHNZAOGNpcFZAFNW1QOWN2aUFPRURjYkoxLXVvSjczMU9wMzdsUUdpWmxtYWRKTGJucGt6OXhITnFNN0tJU28zazc3ZAWFrazRoX0J2Wk9kYVBRMURDakhURWhza3d3"
  },
  "__fb_trace_id__": "BHW2SnV+3/B",
  "__www_request_id__": "A8-osoYA7RyOgutqEmY5zit"
}


tôi cần 1 hàm map ra object với các thông tin gọn gàng, mục đích giảm context và cho vào AI để phân tích content đối thủ, phần tích nội dung, phân tích ảnh, phân tích bình luận của khán giả, phân tích khung giờ đăng video của đối thủ


