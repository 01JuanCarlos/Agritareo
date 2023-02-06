import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { environment } from 'src/environments/environment';

export interface TableSchema { }
export interface FinderSchema {
  id: string;
  controller_id: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataBaseService extends Dexie {
  request: IDBOpenDBRequest;
  connection: 'OPEN' | 'CLOSED' = 'CLOSED';
  store: IDBDatabase;

  nstables: Dexie.Table<TableSchema, number>;
  nsfinder: Dexie.Table<FinderSchema, number>;

  constructor() {
    super(environment.database);
  }

  init() {
    // environment version.
    this.version(environment.databaseVersion).stores({
      nstables: '[id+user_id], meta',
      nsfinder: '[id+controller_id], id, data'
    });

    // this.nsfinder.add({ id: 1, user_id: 9, label: 'Toyota' });
  }
}
