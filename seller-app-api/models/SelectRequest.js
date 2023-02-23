module.exports = (sequelize, DataTypes) => {
    const SelectRequest = sequelize.define('SelectRequest', {
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
        packaging: {
            type: DataTypes.STRING,
            allowNull: true
        },
        selectedLogistics: {
            type: DataTypes.JSONB,
            allowNull: true
        }

    }, {
        freezeTableName: true
    });


    return SelectRequest;
};
