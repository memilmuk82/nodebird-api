const Sequelize = require('sequelize'); // Sequelize 모듈 불러오기
const path = require('path'); // path 모듈 가져오기
const fs = require('fs'); // 파일 시스템 모듈 가져오기
const User = require('./user'); // User 모델 불러오기
const Post = require('./post'); // Post 모델 불러오기
const Hashtag = require('./hashtag'); // Hashtag 모델 불러오기
const env = process.env.NODE_ENV || 'development'; // 현재 환경 설정
const config = require('../config/config')[env];  // 환경 설정 파일 불러오기

const db = {}; // 데이터베이스 객체 생성
const sequelize = new Sequelize( // 데이터베이스 연결 설정
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize; // Sequelize 인스턴스를 db 객체에 추가

// 수동 연결
/* 
db.User = User; // User 모델을 db 객체에 추가
db.Post = Post; // Post 모델을 db 객체에 추가
db.Hashtag = Hashtag; // Hashtag 모델을 db 객체에 추가

User.initiate(sequelize); // User 모델 초기화
Post.initiate(sequelize); // Post 모델 초기화
Hashtag.initiate(sequelize); // Hashtag 모델 초기화

User.associate(db); // User 모델의 연관 관계 설정
Post.associate(db); // Post 모델의 연관 관계 설정
Hashtag.associate(db); // Hashtag 모델의 연관 관계 설정
*/

// 자동 연결
const basename = path.basename(__filename); // 현재 파일의 이름 가져오기
fs
  .readdirSync(__dirname) // 현재 폴더의 모든 파일을 조회
  .filter(file => { // 숨김 파일, index.js, js 확장자가 아닌 파일 필터링
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  // (file.indexOf('.') !== 0): 파일 이름이 '.'으로 시작하지 않는 파일을 필터링
  // (file !== basename): 현재 파일을 필터링
  // (file.slice(-3) === '.js'): 파일 확장자가 '.js'인 파일을 필터링
  .forEach(file => { // 해당 파일의 모델을 불러와서 초기화
    const model = require(path.join(__dirname, file)); // 모델 파일을 불러오기
    console.log(file, model.name); // 파일 이름과 모델 이름 출력
    db[model.name] = model; // 모델을 db객체에 추가
    model.initiate(sequelize); // 모델 초기화
  });

Object.keys(db).forEach(modelName => { // 모델의 연관관계 설정
  if (db[modelName].associate) { // associate 메서드가 존재하면 호출
    db[modelName].associate(db);
  }
});


module.exports = db; // db 객체를 모델로 내보냄