import { Table, Model, Column, ForeignKey, BelongsTo } from 'sequelize-typescript';
import LinkModel from "./link.model";

@Table({ tableName: 'LinkInfo' })
export default class LinkInfoModel extends Model {
  @Column
  price: number;

  @ForeignKey(() => LinkModel)
  @Column
  linkId: number;

  @BelongsTo(() => LinkModel)
  link: LinkModel;
}
