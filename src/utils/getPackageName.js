import { userState } from "../context/UserContext";

export const getPackageName = (packageName) => {

    const { options } = userState();

    return options?.packageOrders.find((item) => item.value == packageName)?.label;
}