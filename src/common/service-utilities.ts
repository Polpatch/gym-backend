import axios, { AxiosRequestConfig } from "axios";
import { createHeader } from "./utils";
import { HttpException, HttpStatus } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { ConfigService } from "@nestjs/config";
import { isAdminRole } from "./constants";

const authService = new AuthService(new ConfigService());
const configService = new ConfigService();

function createConfig(jwt: string, populateAll: boolean, userId: number | null, userRole: string): AxiosRequestConfig {
    const params: any = populateAll ? { populate: '*' } : {};
    
    // Se l'utente non è admin, filtra per userId
    if (!isAdminRole(userRole, configService) && userId !== null) {
        params['filters[user][id]'] = userId;
    }
    
    return {
        params,
        ...createHeader(jwt)
    };
}

async function create<T>(data: T, jwt: string, endpoint: string, name_service: string, config: AxiosRequestConfig) {
    try {
        const response = await axios.post(
        `${endpoint}/api/${name_service}`,
        { data },
        config,
        );

        console.log(`Richiesta eseguita con successo: ${response.data.id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Errore durante l'inserimento del dato: ${error.message}`);
        throw new HttpException('Errore interno del server', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
  

async function findAll(jwt: string, endpoint: string, name_service: string, config: AxiosRequestConfig) {
    try{
        const response = await axios.get(
            `${endpoint}/api/${name_service}`,
            config
        )

        return response.data.data;

    } catch (error) {
        console.error(`Errore durante l'inserimento del dato: ${error.message}`);
        throw new HttpException('Errore interno del server', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

async function findOne(id: number, jwt: string, endpoint: string, name_service: string, config: AxiosRequestConfig) {
    try{
        const response = await axios.get(
            `${endpoint}/api/${name_service}/${id}`,
            config
        )

        return response.data.data;

    } catch (error) {
        if(error.response.status === HttpStatus.NOT_FOUND)
        throw new HttpException(`Record ${id} non trovato`, HttpStatus.NOT_FOUND);

        console.error(`Errore durante l'inserimento del dato: ${error.message}`);
        throw new HttpException('Errore interno del server', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

async function update<T>(id: number, data: T, jwt: string, endpoint: string, name_service: string, config: AxiosRequestConfig) {
    try {
    const response = await axios.put(
        `${endpoint}/api/${name_service}/${id}`,
        { data },
        config,
    );

    console.log(`Richiesta eseguita con successo: ${response.data.id}`);
    return response.data.data;
    } catch (error) {
    if(error.response.status === HttpStatus.NOT_FOUND)
        throw new HttpException(`Record ${id} non trovato`, HttpStatus.NOT_FOUND);
    
    console.error(`Errore durante l'inserimento del dato: ${error.message}`);
    throw new HttpException('Errore interno del server', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

async function remove(id: number, jwt: string, endpoint: string, name_service: string, config: AxiosRequestConfig) {
    try{
        const response = await axios.delete(
        `${endpoint}/api/${name_service}/${id}`,
        config,
        )

        return response.data.data;

    } catch (error) {
        if(error.response.status === HttpStatus.NOT_FOUND)
        throw new HttpException(`Record ${id} non trovato`, HttpStatus.NOT_FOUND);

        console.error(`Errore durante l'inserimento del dato: ${error.message}`);
        throw new HttpException('Errore interno del server', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export {create, findAll, findOne, update, remove, createConfig};