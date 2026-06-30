/*
    This file contains constants used throughout the application.
    Things that'd never change regardless of environment.
*/

const APP_CONSTANTS = {
    EMAIL: {
        DEFAULT_PORT: 587,
    },
    REDIS: {
        DEFAULT_PORT: 6379,
        // TODO: Implement cache if time permits
        // cache: {
        // },
    },
    pagination: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },
};

export default APP_CONSTANTS;
