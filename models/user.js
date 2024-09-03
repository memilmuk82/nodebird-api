const Sequelize = require('sequelize'); // Sequelize 모듈

class User extends Sequelize.Model { // User 모델 정의
    static initiate(sequelize) { // 모델을 초기화하는 정적 메서드, 매개변수: sequelize 인스턴스
        User.init({
            email: { // 이메일 필드
                type: Sequelize.STRING(40), // 최대 40자의 문자열 타입
                allowNull: true, // null 값 허용
                unique: true, // 이메일: 고유값
            },
            nick: { // 닉네임 필드
                type: Sequelize.STRING(15), // 최대 15자의 문자열 타입
                allowNull: false, // null 값 허용 X
            },
            password: { // 비밀번호 필드
                type: Sequelize.STRING(100), // 최대 100자의 문자열 타입
                allowNull: true, // null 값 허용
            },
            provider: { // provider 필드
                type: Sequelize.STRING(10), // 최대 10자의 문자열 타입
                allowNull: false, // null 값 허용 X
                defaultValue: 'local', // 기본값: 'local'
                validate: { // 유효성 검사: 'provider'필드 값이 'local' 또는 'kakao' 중 하나인지 확인
                    isIn: [['local', 'kakao']] 
                }
            },
            snsId: { // snsId 필드
                type: Sequelize.STRING(30), // 최대 30자의 문자열 타입
                allowNull: true, // null 값 허용
            },
        }, {
            sequelize, // Sequlize 인스턴스 연결
            timestamps: true, // createdAt, updatedAt 타임스탬프 자동 추가
            underscored: false, // 필드 이름: 카멜 케이스
            modelName: 'User', // 모델 이름: 'User'
            tableName: 'users', // 테이블 이름: 'users'
            paranoid: true, // deletedAt 타임스탬프 추가 -> 소프트 삭제 활성화
            charset: 'utf8', // 테이블의 문자 집합: UTF-8
            collate: 'utf8_general_ci', // 테이블 정렬 기준: UTF-8 일반 대소문자 구분 없이 설정    
        });
    }

    static associate(db) { // 다른 모델과의 연관 관계 설정
        db.User.hasMany(db.Post); // User 모델은 여러 Post를 가질 수 있음.(1:N 관계)
        db.User.belongsToMany(db.User, { // User 모델은 다른 User 모델과 다대다 관계 (N:M 관계)
            foreignKey: 'followingId', // followingId를 외래키로 설정
            as: 'Followers', // 이 관계를 'Followers'로 참조
            through: 'Follow', // 'Follow' 테이블을 통해 다대다 관계(N:M 관계)를 설정
        });
        db.User.belongsToMany(db.User, { // User 모델은 다른 User 모델과 다대다 관계 (N:M 관계)
            foreignKey: 'followerId', // followingId를 외래키로 설정
            as: 'Followings', // 이 관계를 'Followings'로 참조
            through: 'Follow', // 'Follow' 테이블을 통해 다대다 관계를 설정
        });
        db.User.hasMany(db.Domain); // User 모델은 여러 Domain을 가질 수 있음. (1:N 관계)
    } 
};

module.exports = User; // User 모델을 모듈로 내보냄