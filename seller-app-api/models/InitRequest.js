module.exports = (sequelize, DataTypes) => {
    const InitRequest = sequelize.define('InitRequest', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        logisticsTransactionId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        providerId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        orderId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        selectedLogistics: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        initRequest:{
            type: DataTypes.JSONB,
        },
        onInitResponse:{
            type: DataTypes.JSONB,
        }

    }, {
        freezeTableName: true
    });


    return InitRequest;
};
