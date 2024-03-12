export const OrderFulfillmentStatusMapping = [
    { fulfillmentStatus: "Pending", orderStatus: "Created", seq: 1 },
    { fulfillmentStatus: "Packed", orderStatus: "In-progress", seq: 2 },
    { fulfillmentStatus: "Agent-assigned", orderStatus: "In-progress", seq: 3 },
    { fulfillmentStatus: "Order-picked-up", orderStatus: "In-progress", seq: 4 },
    { fulfillmentStatus: "Out-for-delivery", orderStatus: "In-progress", seq: 5 },
    { fulfillmentStatus: "Order-delivered", orderStatus: "Completed", seq: 6 },
]