# WepAppServer

### 一.請求規格

#### /get/

##### 1.個別商品資訊：
- /product
- /product/:id -> viewcounts.json
> response:
```
{
  "isSuccess": Boolean,
  "productInfos": [ProductInfo],
  "cause": String
}
```
##### 2.推薦：
- /recommendation
- /recommendation/:rank
> response:
```
{
  "isSuccess": Boolean,
  "productInfos": ProductInfo or [ProductInfo, ...],
  "cause": String
}
```
###### 3.顯示評論：
- /comment/:id
> response:
```
{
  "isSuccess": Boolean,
  "comments": [comment-<id>.json, ...]
  "cause": String
}
```
###### 4.圖片：
- /product/image/:id
> response:
```
image.img
```
#### /post/

##### 1.註冊:
- /register -> accounts.json、personalInfos.json 和 purchased-\<account\>.json
> request:
```
{
  "account": String,
  "password": String,
  "username": String,
  "email": String,
  "phonenum": String,
  "address": String
}
```
> response:
```
{
  "isSuccess": Boolean,
  "cause": String
}
```

##### 2.登入:
- /login
> request:
```
{
  "account": String,
  "password": String
}
```
> response:
```
{
  "isSuccess": Boolean,
  "personalInfos": personalInfos[account],
  "cause": String
}
```

##### 3.商品陳列：
- /product
> request:
```
{
  "filters": [String, ...]
}
```
> response:
```
{
  "isSuccess": Boolean,
  "productInfos": [ProductInfo, ...],
  "cause": String
}
```
##### 4.購物車：
- /cart/:account
> request:
```
{
  "password": String
}
```
> response:
```
{
  "isSuccess": Boolean,
  "productInfos": [ProductInfo, ...] // 此處 ProductInfo.amount 紀錄的是該商品加入購物車的數量
  "cause": String
}
```
##### 5.購物車商品數量增減：
- /cart/change/:account -> cart-\<account\>.json (無商品時 delete)
> request:
```
{
  "password": String,
  "products": [{id: String, amount: Int}...]
}
```
> response:
```
{
  "isSuccess": Boolean,
  "cause": String
}
```
##### 6.送出購物車：
- /cart/submit/:account -> verification -> 更新 purchased-\<account\>.json 和 product-\<id\>.json
> request:
```
{
  "password": String
}
```
> response:
```
{
  "isSuccess": Boolean,
  "cause": String
}
```
##### 7.購買紀錄：
- /purchased/:account
> request:
```
{
  "password": String
}
```
> response:
```
{
  "isSuccess": Boolean,
  "productInfos": [ProductInfo, ...], // 此處 ProductInfo.amount 紀錄的是該商品的已購買數量
                                      // 此處的 ProductInfo 會多一個 "isComment" key 紀錄此 account 是否對此 product comment 過,
                                      // archived product 的 "isComment" 設為 True
  "cause": String
}
```
##### 8.寫評論：
- /comment/:account/:id -> 確認 account 買過 pruduct-\<id\> -> 更新 comment-\<id\>.json -> 更新 purchased-\<account\>.json
> request:
```
{
  "rating": Int,
  "comment": String
}
```
> response:
```
{
  "isSuccess": Boolean,
  "cause": String
}
```
### 二. request & response 格式

##### request format:
```
{
  "account": String,
  "password": String,
  "username": Stirng,
  "email": String,
  "phonenum": String,
  "address": String,
  "filters": [String, ...],
  "products": [{id: String, amount: Int}, ...],
  "comment": String
}
```
##### response format
```
{
  "isSuccess": Boolean,
  "personalInfos": PersonalInfo or [PersonalInfo, ...],
  "productInfos": ProductInfo or [ProductInfo, ...],
  "cause": String,
  "comments": [Object, ...]
}
```
##### ProductInfo
```
{
  "id": String,                    // unique for each product
  "name": String,
  "price": Int,
  "author": String,
  "summary": String,
  "amount": Int,                   // available amount, purchased amount or amounts in cart.
  "categories":  [String, ...],    // array
}
```
##### PersonalInfo
```
{
  "username": String,
  "email": String,
  "phonenum": String,
  "address": String
}
```

### 三. 需要建立的 files 名及其格式

##### JS files
- server.js
- adjustproduct.js (maybe)

##### JSON files (Contributed by 組員 楊孟翰)
- accounts.json
```
{
  "account": password,
  ...
}
```
- personalInfos.json
```
{
  "account": PersonalInfo,
  ...
}
```
- cart-\<account\>.json
```
{
  "id": amount,
  ...
}
```
- purchased-\<account\>.json 
```
{
  "id": [amount, isComment], // archived product 的 isComment 設為 true
  ...
}
```
- products.json
```
{
  "id": amount,
  ...
}
```
- archived/products.json (管理下架的 product)
```
{
  "id", "YYYY-MM-DD",
  ...
}
```
- product-\<id\>.json
- archived/product-\<id\>.json (保留下架的 product 使購買紀錄能正確顯示)
```
ProductInfo
```
- comment-\<id\>.json
```
{
  "account": [rating, comment],
  ...
}
```
- recommendations.json
```
{
  "order": id,
  ...
}
```
- cause.json -> array (maybe)
```
{
  "cause": cause,
  ...
}
```
- viewcounts.json (killed periodically)
```
{
  "id": counts,
  ...
}
```
##### IMAGE files
> image-\<id\>.img

##### P.S: 我們將 image 的 request 獨立出來，這樣 response 的格式會比較單純。

### 四、檔案管理：
1. accounts.json、personalInfos.json 和 products.json 必須存在且格式正確 (可為空 Object) <br>
2. 所有 productID in products.json 都必須有相對應的 product-\<id\>.json <br>
3. 所有 account in accounts.json 都必須有相對應的 account in personalInfos.json <br>
4. 每日午夜手動刪除 viewcounts.json，並用前三多 counts 的 productID 手動更新 recommendations.json <br>