import type { ICatalogModel } from "../../domain/model/index.ts";

export interface ICatalogRepository {
	findById(id: string): Promise<ICatalogModel | null>;
	findAll(includeArchived?: boolean): Promise<ICatalogModel[]>;
	findByName(name: string): Promise<ICatalogModel | null>;
	save(catalog: ICatalogModel): Promise<string>;
	update(id: string, catalog: Partial<ICatalogModel>): Promise<void>;
	delete(id: string): Promise<void>;
	count(includeArchived?: boolean): Promise<number>;
}
