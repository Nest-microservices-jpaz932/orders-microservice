import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    PRODUCTS_MICROSERVICE_HOST: string;
    PRODUCTS_MICROSERVICE_PORT: number;
}

const envSchema = joi
    .object({
        PORT: joi.number().required(),
        PRODUCTS_MICROSERVICE_HOST: joi.string().required(),
        PRODUCTS_MICROSERVICE_PORT: joi.number().required(),
    })
    .unknown(true);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { error, value } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value as EnvVars;

const {
    PORT: port = 3000,
    PRODUCTS_MICROSERVICE_HOST: productsMicroserviceHost,
    PRODUCTS_MICROSERVICE_PORT: productsMicroservicePort,
} = envVars;

export const envs = {
    port,
    productsMicroserviceHost,
    productsMicroservicePort,
};
