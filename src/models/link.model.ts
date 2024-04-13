import { Table, Column, Model, HasMany } from 'sequelize-typescript';
import LinkInfoModel from "./link.info.model";

@Table({ tableName: 'Link' })
export default class LinkModel extends Model {
  @Column
  chatId: string;

  @Column
  link: string;

  @Column
  name: string;

  @Column
  image: string;

  @HasMany(() => LinkInfoModel)
  info: LinkInfoModel[];
}
