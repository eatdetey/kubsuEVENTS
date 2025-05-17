import {$authHost, $host} from "./index";
import { jwtDecode } from "jwt-decode";

export const createEvent = async (formData) => {
    const { data } = await $authHost.post('api/eventpost', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
};

export const updateEvent = async (id, data) => {
    const response = await $authHost.put('api/eventpost/' + id, data);
    return response.data;
};

export const fetchEvents = async () => {
    const {data} = await $host.get('api/eventpost')
    return data
}

export const fetchOneEvent = async (id) => {
    const {data} = await $host.get('api/eventpost/' + id)
    return data
}