import {$authHost, $host} from "./index";
import { jwtDecode } from "jwt-decode";

export const createEvent = async (event) => {
    if (!event.img) {
        throw new Error('Изображение обязательно');
    }
    const { data } = await $authHost.post('api/eventpost', event);
    return data;
};
export const fetchEvents = async () => {
    const {data} = await $host.get('api/eventpost')
    return data
}

export const fetchOneEvent = async (id) => {
    const {data} = await $host.get('api/eventpost/' + id)
    return data
}