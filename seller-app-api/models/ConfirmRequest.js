module.exports = (sequelize, DataTypes) => {
    const ConfirmRequest = sequelize.define('ConfirmRequest', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        providerId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        logisticsTransactionId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        orderId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        retailOrderId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        selectedLogistics: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        confirmRequest: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        onConfirmResponse:{
            type: DataTypes.JSONB,
        }

    }, {
        freezeTableName: true
    });


    return ConfirmRequest;
};
