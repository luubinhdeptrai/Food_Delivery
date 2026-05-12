1. Khi thêm món vào Cart:
{
    "menuItemId":     "4dc7cdfa-5a54-402f-b1a8-2d47de146081",
    "restaurantId":   "fe8b2648-2260-4bc5-9acd-d88972148c78",
    "restaurantName": "Phở Bắc",
    "itemName":       "Phở Bò Tái Nạm",
    "unitPrice":      85000,
    "quantity":       2,
    "selectedModifiers": [
      {
        "groupId":    "ee000002-0000-4000-8000-000000000002",
        "groupName":  "Topping thêm",
        "optionId": "ff000006-0000-4000-8000-000000000006",
        "optionName": "Thêm gân",
        "price":      15000
      }
    ]
}

-> KẾT QUẢ:

{
  "cartId": "11183bdf-10ec-41c4-9bb5-52977f11fe0d",
  "customerId": "43e0e67d-b085-4896-8f47-b708c025a4b4",
  "restaurantId": "fe8b2648-2260-4bc5-9acd-d88972148c78",
  "restaurantName": "Phở Bắc",
  "items": [
    {
      "cartItemId": "bfecbc86-250e-4e6c-ab97-63e45bc8d015",
      "menuItemId": "4dc7cdfa-5a54-402f-b1a8-2d47de146081",
      "itemName": "Phở Bò Tái Nạm",
      "unitPrice": 85000,
      "quantity": 2,
      "subtotal": 170000,
      "selectedModifiers": [
        {
          "groupId": "ee000001-0000-4000-8000-000000000001",
          "groupName": "Kích cỡ",
          "optionId": "ff000001-0000-4000-8000-000000000001",
          "optionName": "Tô nhỏ",
          "price": 0
        }
      ]
    }
  ],
  "totalAmount": 170000,
  "createdAt": "2026-05-11T23:41:38.677Z",
  "updatedAt": "2026-05-11T23:41:38.693Z"
}

-> PHỎNG ĐOÁN BAN ĐẦU: Có thể do Kích cỡ Tô nhỏ là Default nên các options còn lại bị ghi đè không lưu được