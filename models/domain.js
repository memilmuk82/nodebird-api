const Sequelize = require('sequelize'); // Sequelize 라이브러리 

class Domain extends Sequelize.Model { // Sequelize의 Model 클래스를 확장하여 Domain 모델 정의
    static initiate(sequelize) { // Domain 모델을 초기화하는 메서드를 정의
        Domain.init({ // Domain 모델의 속성과 설정 정의
            host: { // 'host' 속성 정의
                type: Sequelize.STRING(80), // 최대 80자의 문자열 타입 사용
                allowNull: false, // 값이 null이 되지 않도록 설정
            },
            type: { // 'type' 속성 정의
                type: Sequelize.ENUM('free', 'premium'), // 'free' 또는 'premium' 중 하나의 값을 가질 수 있는 ENUM 타입
                allowNull: false, // 값이 null이 되지 않도록 설정
            },
            clientSecret: { // 'clientSecret' 속성 정의, 다른 개발자들이 NodeBird API를 사용할 때 필요한 비밀키
                type: Sequelize.UUID, // 고유한 식별자(UUID -> 충돌 가능성이 매우 적은 랜덤한 문자열) 타입 사용
                allowNull: false, // 값이 null이 되지 않도록 설정
            },
        }, {
            sequelize, // 연결된 sequelize 인스턴스 전달
            timestamps: true, // 생성 및 수정 시간을 자동으로 추가
            paranoid: true, // 레코드를 실제로 삭제하지 않고 '삭제된' 상태로 표시
            modelName: 'Domain', // 모델의 이름 설정
            tableName: 'domains', // 데이터베이스 테이블의 이름 설정
        });
    }

    static associate(db) { // 다른 모델과의 관계를 정의하는 메서드
        db.Domain.belongsTo(db.User); // Domain 모델은 User 모델에 속해 있음. (1:N 관계)
    }
};

module.exports = Domain; // Domain 클래스를 모듈로 내보냄.