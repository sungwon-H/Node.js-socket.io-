const mongoose = require('mongoose');

let database = {}; // 

database.init = function(app, config){
    console.log('database init() 호출');
    connect(app, config); // 설정값을 저장할 config 파일을 사용 db연결  컨넥트 함수 호출
}

function connect(app, config){
    console.log('connect() 호출!');
     mongoose.Promise = global.Promise; // 프로미스객체 전역 사용
     mongoose.connect(config.db_url); //  컨피그 안에 유알엘 정보 db_url: 'mongodb://localhost:27017/nodedb'
     database.db = mongoose.connection; // db안에 해당정보를 넣는다 //위에 연결된 정보를 저장 

     database.db.on('error', console.error.bind(console, 'mongoose connection error')); // 디비 에러시
     database.db.on('open', () =>{ // 연결 성공시 
         console.log('데이터베이스 연결 성공');
        createSchema(app, config); // 스키마 생성 함수 호출 
     });

}
function createSchema(app, config){ // 
    const schemaLen = config.db_schemas.length; // 컨피그 객체안에있는 디비 스키마 랭스 db_schemas: [{file:'./member_schema', collection:'member2', schemaName:'MemberSchema', modelName:'MemberModel'}],
    console.log('설정된 정의된 스키마의 개수 :%d ',schemaLen);
    
    for(let i=0; i<schemaLen; i++){ // 반복문이 돌면서 해당내용 읽어와서 그대로 실행  // 어차피 길이가 1만 있음 i=0
        const curItem = config.db_schemas[i]; // 컨피그의 0번 {file:'./member_schema', collection:'member2', schemaName:'MemberSchema', modelName:'MemberModel'}
        const curSchema = require(curItem.file).createSchema(mongoose); // file:'./member_schema 멤버 언더바 스키마 파일을 불러와서 스키마를 만듬 몽구스를 이용하여 
        console.log(`${curItem.file} 모듈을 불러들인 후 스키마를 정의함`, curItem.file);

        const curModel = mongoose.model(curItem.collection, curSchema); // member2
        console.log('%s 컬렉션을 위해 모델 정의함', curItem.collection);


        database[curItem.schemaName] = curSchema; // database[member_schema]
        database[curItem.modelName] = curModel;     // datbase[member2]
        console.log('스키마이름[%s], 모델이름[$s]이 데이터베이스 객체의 속성으로 추가 되었습니다.',

        curItem.schemaName, curItem.modelName);
        app.set('database', database);// 여태까지 저장한 값을 데이터베이스에  담음
        console.log('database 객체가 app 객체의 속성으로 추가됨');
    }
}

module.exports = database;
