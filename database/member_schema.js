const {Schema} = require('mongoose'); // 스키마는 몽구스

const crypto = require('crypto'); // 암호화 모듈 
const { fileURLToPath } = require('url');
const { setFlagsFromString } = require('v8');


Schema.createSchema = function(mongoose){
    console.log('createSchema() 호출');
    const MemberSchema = mongoose.Schema({
        userid:{type:String, require: true, default:''}, // 타입 문자열 필수 입력 
        hashed_password: {type: String, default:''}, // 하나의 스키마 // 암호화된 패스워드 
        name: {type: String, default:''},
        salt: {type: String},// 무엇으로 암호화를 하였는디 그 키 값을 저장 복호화  // 암호화된 키 
        age: {type: Number, default:''},
        email: {type: String, default:'' },
        created_at: {type:Date, default:Date.now},
        updated_at: {type:Date, default:Date.now},
        provider: {type: String, default: ''},
        authToken:{type: String, default:''}, // 페이스북만의 키값
        facebook: {},
        naver: {},
        kakao: {}
    });


    MemberSchema.virtual('userpw')// uesrpw 찾아서 해쉬드 패스워드랑 맵핑
    .set(function(userpw){
        this._userpw = userpw; // 
        this.salt = this.makeSalt(); // salt값 저장 
        this.hashed_password = this.encryptPassword(userpw); // 패스워드를 넣어서 해쉬패드 만듬 

    })
    .get(function(){ // 만약 패스워드가 보고 싶다면 
        return this._userpw; // 현재 저장된 패스워드 리턴 
    });

    MemberSchema.method('makeSalt', function(){ // 메소드를 만든다 메이크 솔트 메소드
        console.log('makeSalt()호출');
        // 3032050325 예를 든 숫자가 salt 값이 된다 
        return Math.round((new Date().valueOf * Math.random()))+ ''; // 타임스탬프로 나오는 값을 랜덤값과 곱해준다.  '';문자열 더함 

    });
    // 사용자가 입력한 값이 plainText에 들어간다  
    MemberSchema.method('encryptPassword', function(plainText, inSalt){
        console.log('encryptPassword() 호출!')
        if(inSalt){ // 회원가입을 할때 처음엔 insalt로 들어오지 않는다 그래서 else 빠진다 // 로그인 할때
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
            // 1234 입력 시 데이터베이스에 있는 salt를 가져온다 1234랑 섞어준다 -> 16진수로 변환 -> 비밀번호 
        }else{ // 회원가입 할때 
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex') // 암호화시키는 
            // 1234  -> 435654723 같이 석어서 암화화  > 16진수로 변환 > 비밀번호로 사용 
        }
    });
    // 전역 메소드 인증 쪽 
    MemberSchema.method('authenticate', function(plainText, inSalt, hashed_password){
        if(inSalt){
            console.log('authenticate 호출 : inSalt(있음)');
            return this.encryptPassword(plainText, inSalt) == hashed_password;
        }else{
            console.log('authenticate 호출 : inSalt(없음)');
            return this.encryptPassword(plainText) == this.hashed_password;
        }
    })
    // 어떤 작업이 이루어지기 이전에 자동으로 이루어져라 
    MemberSchema.pre('save',(next) =>{// 회원가입을 시키기전에 먼저 한번 호출되라는 뜻
        if(!this.inNew) return next(); // 새로운 값이 들어온게 아니라면
        if(!validataPresenceOf(this.userpw)){// 값을 체그
            next(new Error('유효하지 않은 password 입니다.')); // 값이 맞지 않다면 
        }else{
            next(); // 값이 있다면 
        }
    });

    const validataPresenceOf = function(value){
        return value && value.length; // 데이터가 있는지 여부 
    }

    console.log('MemberSchema 정의완료!');
    return MemberSchema; // 생성한 크리에이트 스키마 리턴

};

module.exports = Schema; // 모듈 밖에서 사용가능 어떤 이름으로든지 사용가능 

