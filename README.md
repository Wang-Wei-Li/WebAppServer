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
  "productInfos": [ProductInfo],
  "cause": String
}
```
###### 3.顯示評論：
- /comment/:id
> response:
```
{
  "isSuccess": Boolean,
  "comments": [String...],
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
- /register -> accounts.json
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
  "cause": String
}
```

##### 3.商品陳列：
- /product
> request:
```
{
  "filters": [String...]
}
```
> response:
```
{
  "isSuccess": Boolean,
  "productInfos": [ProductInfo],
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
  "productInfos": [ProductInfo] // 此處 ProductInfo.amount 紀錄的是該商品加入購物車的數量
  "cause": String
}
```
##### 5.購物車商品數量增減：
- /cart/change/:account
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
  "isSuccess": Boolean
}
```
##### 6.送出購物車：
- /cart/submit/:account -> check product amount -> 更新 purchased-\<account\>.json
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
  "productInfos": [ProductInfo] // 此處 ProductInfo.amount 紀錄的是該商品的已購買數量
}
```
##### 8.寫評論：
- /comment/:account/:id -> 更新 comment-\<id\>.json
> request:
```
{
  "password": String,
  "comment": String
}
```
> response:
```
{
  "isSuccess": Boolean
}
```
### 二. request & response 格式

##### request format:
```
{
  "account": String,
  "password": String,
  "filters": [String...],
  "products": [{id: String, amount: Int}...],
  "comment": String
}
```
##### response format
```
{
  "isSuccess": Boolean,
  "productInfos": [ProductInfo],
  "amount": Int,
  "cause": String,
  "comments": [String...]
}
```
##### ProductInfo
```
{
  "id": String,                 // unique for each product
  "name": String,
  "price": Int,
  "author": String,
  "summary": String,
  "amount": Int,                // available amount
  "categories":  [String...]    // array
}
```

### 三. 需要建立的 files 名及其格式

##### JS files
- server.js
- adjustproduct.js

##### JSON files (Contributed by 組員 楊孟翰)
- accounts.json
```
{
  "account": password,
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
  "id": amount,
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
- product-\<id\>.json
```
see ProductInfo
```
- comment-\<id\>.json -> array
```
{
  "account": comment,
  ...
}
```
- recommendations.json -> array
```
{
  "order": id,
  ...
}
```
- cause.json -> array
```
{
  "cause": cause,
  ...
}
```
- viewcounts.json (killed every midnight)
```
{
  "id": counts,
  ...
}
##### IMAGE files
> image-\<id\>.img

##### P.S: 我們將 image 的 request 獨立出來，這樣 response 的格式會比較單純。
