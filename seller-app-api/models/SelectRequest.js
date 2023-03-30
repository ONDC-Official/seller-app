module.exports = (sequelize, DataTypes) => {
    const SelectRequest = sequelize.define('SelectRequest', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        transactionId: { //retail transaction id
            type: DataTypes.STRING,
            allowNull: false
        },
        logisticsTransactionId:{
            type: DataTypes.STRING,
        },
        providerId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        packaging: {
            type: DataTypes.STRING,
            allowNull: true
        },
        selectedLogistics: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        selectRequest:{
            type: DataTypes.JSONB,
        },
        onSelectResponse:{
            type: DataTypes.JSONB,
        }
    }, {
        freezeTableName: true
    });


    return SelectRequest;
};
