import React, { createContext } from 'react';
import DiviaAPI from '@gauthier-th/divia-api-v2';
import Database from './Database';

const diviaApi = new DiviaAPI();

const initialState = {
	diviaApi,
	database: new Database()
};

export const Context = createContext(initialState);

export default function GlobalStore({ children }) {
	return <Context.Provider value={initialState}>
		{children}
	</Context.Provider>;
}