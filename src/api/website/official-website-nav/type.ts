/** 官网导航列表查询参数 */
export interface OfficialWebsiteNavPageQuery {
  /** 标题 */
  title?: string;
}

/** 官网动态导航表单对象 */
export interface OfficialWebsiteNavForm {
  /** 主键 */
  id?: number;
  /** 父菜单ID */
  parentId?: number;
  /** 菜单类型（1 外链 , 2 路由） */
  type?: number;
  /** 跳转地址 */
  linkTo?: string;
  /** 标题 */
  title?: string;
  /** 显示顺序 */
  sort?: number;
  /** 备注 */
  remark?: string;
}


/** 官网动态导航分页对象 */
export interface OfficialWebsiteNavVO {
  /** 主键 */
  id?: number;
  /** 父菜单ID */
  parentId?: number;
  /** 菜单类型（1 外链 , 2 路由） */
  type?: number;
  /** 跳转地址 */
  linkTo?: string;
  /** 标题 */
  title?: string;
  /** 备注 */
  remark?: string;
  /** 显示顺序 */
  sort?: number;
  /** 创建人 ID */
  createBy?: number;
  /** 创建时间 */
  createTime?: Date;
  /** 更新人ID */
  updateBy?: number;
  /** 更新时间 */
  updateTime?: Date;
  /** 子菜单 */
  children?: OfficialWebsiteNavVO[];
}
