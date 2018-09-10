//Mongoose Connection
const mongoose = require('mongoose');
// var mongoXlsx = require('mongo-xlsx');
// xlsxj = require("xlsx-to-json");

mongoose.connect('mongodb://admin:admin123@ds141902.mlab.com:41902/charlesbot');
var db=mongoose.connection;
db.on("error",console.error.bind(console,"Connection error"))
db.once("open",function(callback){
  console.log('Connection Succeeded');
})

// Client Risk Profile
var Schema=mongoose.Schema;
var clientRiskSchema=new Schema({
    ClientID:String,
    RiskCategory:String,
    From:String,
    To:String,
    Active:String
})
var productSchema=new Schema({
    ProductID:String,
    Name:String,
    Type:String,
    ExternalIdentifier:String,
    ExternalIdentifierType:String,
    Sector:String,
    SectorName:String,
    RiskType:String
})
var clientSchema=new Schema({
    ClientId:String,
    Name:String,
    ClientType:String,
    Age:String
})
var holdingSchema=new Schema({
    CustomerID:String,
    ProductID:String,
    Quantity:String,
    CurrentPrice:String,
    MarketValue:String
})
var productperformSchema=new Schema({
    ProductID:String,
    Currentprice:String,
    Previousday:String,
    Daychange:String,
    PercentageChange:String,
    Performance:String
})
var productperformance =mongoose.model("productperformance",productperformSchema);
var holdings =mongoose.model("holdings",holdingSchema);
var clientProfile =mongoose.model("clientProfile",clientSchema);
var product =mongoose.model("product",productSchema);
var clientriskprofile =mongoose.model("clientriskprofiles",clientRiskSchema);
let ClientRiskProfileGet=function(obje){
    return clientriskprofile.find(obje);
}
let ProductGet=function(obje){
    return product.find(obje);
}
let ClientProfileGet=function(obje){
    return clientProfile.find(obje);
}
let holdingsProfileGet=function(obje){
    return holdings.find(obje);
}
let productperformanceGet=function(obje){
    return productperformance.find(obje);
}
let clientRiskProfileUpdate=function(clientID,obje){
    clientriskprofile.where({ ClientID: clientID }).update({ $set: obje})
}


let giveFundDetails=function(clientID,RiskType){
   return product.aggregate([ { $project : {
        ProductIDStatus:{ $ne: [ "$ProductID", clientID] },
        ProductID : 1,
        Name : 1 ,
        RiskType : 1,
        Type:1
    }},{ $match : { RiskType : RiskType, Type : "ETF"  } },{$lookup:{
        from:"holdings",
        localField:"ProductID",
        foreignField:"ProductID",
        as: "productHoldings"
        }},
    { $unwind: { path: "$productHoldings", preserveNullAndEmptyArrays: true }}
]);
}
let getLowPerformingFund=function(clientID){
    return holdings.aggregate([ {$lookup:{
        from:"products",
        localField:"ProductID",
        foreignField:"ProductID",
        as: "product"
        }},
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true }},{$lookup:{
        from:"productperformances",
        localField:"ProductID",
        foreignField:"ProductID",
        as: "productHoldings"
        }},
        { $unwind: { path: "$productHoldings", preserveNullAndEmptyArrays: true }},{ $project : {
        product:1,
        ProductID : 1,
        CustomerID: 1,
        Quantity : 1 ,
        CurrentPrice : 1,
        MarketValue:1,
        productHoldings:1
    }},{ $match : { CustomerID : clientID,'productHoldings.Performance':'LOW','product.Type':'ETF' } }
])
}
// let getLowPerformingFund=function(clientID){
//    return holdings.aggregate([ { $holdings : {
//         // ProductIDStatus:{ $ne: [ "$ProductID", clientID] },
//         ProductID : 1,
//     }},{ $match : { RiskType : RiskType, Type : "ETF"  } },{$lookup:{
//         from:"holdings",
//         localField:"ProductID",
//         foreignField:"ProductID",
//         as: "productHoldings"
//         }},
//     { $unwind: { path: "$productHoldings", preserveNullAndEmptyArrays: true }}
// ]);
// }
module.exports.holdingsProfileGet=holdingsProfileGet;
module.exports.giveFundDetails=giveFundDetails;
module.exports.ClientRiskProfileGet=ClientRiskProfileGet;
module.exports.clientRiskProfileUpdate=clientRiskProfileUpdate;
module.exports.ClientProfileGet=ClientProfileGet;
module.exports.getLowPerformingFund=getLowPerformingFund;
module.exports.ProductGet=ProductGet;
module.exports.productperformanceGet=productperformanceGet;























// Client Profile
// var Schema=mongoose.Schema;
// var clientSchema=new Schema({
//     ClientId:String,
//     Name:String,
//     ClientType:String,
//     Age:String
// })
// var clientProfile =mongoose.model("clientProfile",clientSchema);

// mongoXlsx.xlsx2MongoData("./Book1.xlsx", null, function(err, mongoData) {
//     mongoData.forEach(element => {
//         var clientDetails=new clientProfile({
//             ClientId:element.ClientId,
//             Name:element.Name,
//             ClientType:element.ClientType,
//             Age:element.Age
//         })
//         clientDetails.save(function(error){
//             console.log("Your Client Profile has been saved!!!");
//             if(error){
//                 console.log(error)
//             }
        
//         })
//     });

 
// });
  
// Client Risk Profile
// var Schema=mongoose.Schema;
// var clientSchema=new Schema({
//     ClientID:String,
//     RiskCategory:String,
//     From:String,
//     To:String,
//     Active:String
// })
// var clientriskprofile =mongoose.model("clientriskprofile",clientSchema);
// mongoXlsx.xlsx2MongoData("./Book1.xlsx", clientSchema, function(err, mongoData) {
//     // console.log(mongoData[0].From.toString());
//     mongoData.forEach(element => {
        
//         var clientDetails=new clientriskprofile({
//             ClientID:element.ClientID,
//             RiskCategory:element.RiskCategory,
//             From:element.From,
//             To:element.To,
//             Active:element.Active
//         })
//         clientDetails.save(function(error){
//             console.log("Your Client Risk Profile has been saved!!!");
//             if(error){
//                 console.log(error)
//             }
        
//         })
//     });
// });
//Product
// var Schema=mongoose.Schema;
// var clientSchema=new Schema({
//     ProductID:String,
//     Name:String,
//     Type:String,
//     ExternalIdentifier:String,
//     ExternalIdentifierType:String,
//     Sector:String,
//     SectorName:String,
//     RiskType:String
// })
// var product =mongoose.model("product",clientSchema);

// xlsxj({
//     input: "./Book1.xlsx", 
//     output: "./output.json"
//   }, function(err, mongoData) {
//     if(err) {
//       console.error(err);
//     }else {
//     // console.log(mongoData[0].From.toString());
//     mongoData.forEach(element => {
        
//         var productDetails=new product({
//             ProductID:element.ProductID,
//             Name:element.Name,
//             Type:element.Type,
//             ExternalIdentifierType:element.ExternalIdentifierType,
//             ExternalIdentifier:element.ExternalIdentifier,
//             Sector:element.Sector,
//             SectorName:element.SectorName,
//             RiskType:element.RiskType
//         })
//         productDetails.save(function(error){
//             console.log("Your Product has been saved!!!");
//             if(error){
//                 console.log(error)
//             }
        
//         })
  
    
// });

//     }
// });
// holdings
// var Schema=mongoose.Schema;
// var holdingSchema=new Schema({
//     CustomerID:String,
//     ProductID:String,
//     Quantity:String,
//     CurrentPrice:String,
//     MarketValue:String
// })
// var holdings =mongoose.model("holdings",holdingSchema);
// mongoXlsx.xlsx2MongoData("./Book1.xlsx", holdingSchema, function(err, mongoData) {
//     // console.log(mongoData[0].From.toString());
//     mongoData.forEach(element => {
        
//         var productDetails=new holdings({
//             CustomerID:element.CustomerID,
//             ProductID:element.ProductID,
//             Quantity:element.Quantity,
//             CurrentPrice:element.CurrentPrice,
//             MarketValue:element.MarketValue
//         })
//         productDetails.save(function(error){
//             console.log("Your Holdings has been saved!!!");
//             if(error){
//                 console.log(error)
//             }
        
//         })
//     });
// });



// Transactions
// var Schema=mongoose.Schema;
// var transactionSchema=new Schema({
//     CustomerID:String,
//     ProductID:String,
//     Quantity:String,
//     Price:String,
//     Action:String,
//     Date:String
// })
// var transactions =mongoose.model("transactions",transactionSchema);
// xlsxj({
//     input: "./Book1.xlsx", 
//     output: "./output.json"
//   }, function(err, mongoData) {
//     if(err) {
//       console.error(err);
//     }else {
    
//         mongoData.forEach(element => {
//             var transactionDetails=new transactions({
//                 CustomerID:element.CustomerID,
//                 ProductID:element.ProductID,
//                 Quantity:element.Quantity,
//                 Price:element.Price,
//                 Action:element.Action,
//                 Date:element.Date
//             })
//             transactionDetails.save(function(error){
//                 console.log("Your transactionDetails has been saved!!!");
//                 if(error){
//                     console.log(error)
//                 }
            
//             })
//         });
//     }
//   });


//Product Performance

// var Schema=mongoose.Schema;
// var productperformSchema=new Schema({
//     ProductID:String,
//     Currentprice:String,
//     Previousday:String,
//     Daychange:String,
//     PercentageChange:String,
//     Performance:String
// })
// var productperformance =mongoose.model("productperformance",productperformSchema);
// xlsxj({
//     input: "./Book1.xlsx", 
//     output: "./output.json"
//   }, function(err, mongoData) {
//     if(err) {
//       console.error(err);
//     }else {
    
//         mongoData.forEach(element => {
//             var transactionDetails=new productperformance({
//                 ProductID:element.ProductID,
//                 Currentprice:element.Currentprice,
//                 Previousday:element.Previousday,
//                 Daychange:element.Daychange,
//                 PercentageChange:element.PercentageChange,
//                 Performance:element.Performance
//             })
//             transactionDetails.save(function(error){
//                 console.log("Your Product Performance has been saved!!!");
//                 if(error){
//                     console.log(error)
//                 }
            
//             })
//         });
//     }
//   });