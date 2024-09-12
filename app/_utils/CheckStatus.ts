export const CheckStatus = (status: string) => {
    switch (status) {
        case "pending":
            return "bg-yellow-100 text-yellow-600"
        case "completed":
            return "bg-green-100 text-green-600"
        case "failed":
            return "bg-red-100 text-red-600"
        default:
            return "bg-gray-100 text-gray-600"

    }
}