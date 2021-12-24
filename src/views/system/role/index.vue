<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container" style="height:57px">
      <div class="crud-opts">
        <span class="crud-opts-left">
          <el-button v-permission="['role:create']" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="handleCreate()"> 新增 </el-button>
          <el-button v-permission="['role:edit']" class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="roleSelections.length !== 1" @click="handleUpdate(roleSelections[0])"> 修改 </el-button>
          <el-popconfirm v-permission="['role:delete']" :title="`确认删除所选${roleSelections.length}条数据吗？`" @onConfirm="handleDelete(roleSelections[0])">
            <el-button slot="reference" class="filter-item" type="danger" icon="el-icon-delete" size="mini" :disabled="roleSelections.length !== 1"> 删除 </el-button>
          </el-popconfirm>
        </span>
      </div>
    </div>
    <!-- 表格渲染 -->
    <el-row :gutter="15">
      <!--角色管理-->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" style="margin-bottom: 10px">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">角色列表</span>
          </div>
          <el-table ref="roleTable" :key="tableKey" v-loading="listLoading" highlight-current-row style="width: 100%;" :data="list" @selection-change="handleSelectionChange" @current-change="handleCurrentChange">
            <el-table-column type="selection" width="50" />
            <el-table-column label="角色名称" prop="title" />
            <el-table-column label="角色标识" prop="name" />
            <el-table-column :show-overflow-tooltip="true" label="角色描述" prop="remark" />
            <el-table-column width="135px" label="创建日期" prop="createTime" />
            <el-table-column label="操作" width="130px" align="center" fixed="right">
              <template slot-scope="{ row }">
                <el-button v-permission="['role:edit']" size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
                <el-popconfirm v-permission="['role:delete']" title="确认删除本条数据吗？" @onConfirm="handleDelete(row)">
                  <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" />
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getRoleList()" />
        </el-card>
      </el-col>
      <!-- 菜单授权 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <el-tooltip class="item" effect="dark" content="选择指定角色分配菜单" placement="top">
              <span class="role-span">菜单分配</span>
            </el-tooltip>
            <el-button :disabled="!showButton" :loading="menuLoading" icon="el-icon-check" size="mini" style="float: right; padding: 6px 9px" type="primary" @click="handleMenuSave"> 保存 </el-button>
          </div>
          <el-tree
            ref="menuTree"
            lazy
            :data="menus"
            :default-checked-keys="menuIds"
            :load="getMenuList"
            :props="defaultProps"
            check-strictly
            accordion
            show-checkbox
            node-key="id"
            @check="handleMenuChange"
          />
        </el-card>
      </el-col>
    </el-row>
    <!-- 表单渲染 -->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="titleMap[dialogStatus] + '角色'" width="520px">
      <el-form ref="dataForm" :inline="true" :model="formData" :rules="rules" size="small" label-width="80px">
        <el-form-item label="角色名称" prop="title">
          <el-input v-model="formData.title" style="width: 380px;" />
        </el-form-item>
        <el-form-item label="角色标识" prop="name">
          <el-input v-model="formData.name" style="width: 145px;" />
        </el-form-item>
        <el-form-item label="角色描述" prop="remark">
          <el-input v-model="formData.remark" style="width: 380px;" rows="5" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { roleCreate, roleDelete, roleList, roleMenuUpdate, roleUpdate } from '@/api/system/role'
import { menuList } from '@/api/system/menu'
import Pagination from '@/components/Pagination'

const defaultListQuery = {
  page: 1,
  size: 20,
  filters: {}
}

const defaultMenuListQuery = {
  page: 1,
  size: 50,
  filters: {
    struct: 'tree',
    pid: 0,
    depth: 1
  }
}

const defaultFormData = {
  title: '',
  name: '',
  remark: ''
}

export default {
  name: 'RoleList',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      roleSelections: [],
      list: [],
      total: 0,
      listLoading: true,
      listQuery: Object.assign(JSON.parse(JSON.stringify(defaultListQuery))),
      showButton: false,
      menuLoading: false,
      menus: [],
      currentRoleId: 0,
      menuIds: [],
      defaultProps: { label: 'title', children: 'children', isLeaf: 'leaf' },
      menuListQuery: Object.assign(JSON.parse(JSON.stringify(defaultMenuListQuery))),
      dialogStatus: 'create',
      titleMap: {
        'create': '新增',
        'update': '编辑'
      },
      dialogFormVisible: false,
      formData: Object.assign(JSON.parse(JSON.stringify(defaultFormData))),
      rules: {
        title: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        name: [{ required: true, message: '请输入角色标识', trigger: 'blur' }],
        remark: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    getRoleList() {
      this.listLoading = true
      roleList(this.listQuery).then((res) => {
        this.list = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },
    // 获取目录列表
    getMenuList(node, resolve) {
      setTimeout(() => {
        this.menuListQuery.filters.pid = node.data.id ? node.data.id : 0
        menuList(this.menuListQuery).then((res) => {
          const menuData = res.data.records
          menuData.forEach(element => {
            element.children = null
            if (element.hasChildren) {
              element.leaf = false
            } else {
              element.leaf = true
            }
          })
          resolve(menuData)
        })
      }, 100)
    },
    // 新增角色
    handleCreate() {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 编辑角色
    handleUpdate(row) {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      for (const key in this.formData) {
        this.formData[key] = row[key]
      }
      this.formData = Object.assign(this.formData, { id: row.id })
    },
    // 表格提交
    handleConfirm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            roleCreate(this.formData).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '新增角色成功！',
                type: 'success'
              })
              this.listQuery = Object.assign(JSON.parse(JSON.stringify(defaultListQuery)))
              this.getRoleList()
            })
          }
          if (this.dialogStatus === 'update') {
            const updateData = this.formData
            roleUpdate(this.formData).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '编辑角色成功！',
                type: 'success'
              })
              const index = this.list.findIndex(v => v.id === updateData.id)
              if (index !== -1) {
                this.list[index].title = updateData.title
                this.list[index].name = updateData.name
                this.list[index].remark = updateData.remark
              }
            })
          }
        }
      })
    },
    // 删除角色
    handleDelete(row) {
      roleDelete(row.id).then((res) => {
        this.$message({
          message: '删除成功！',
          type: 'success'
        })
        const index = this.list.findIndex(v => v.id === row.id)
        if (index !== -1) {
          this.list.splice(index, 1)
        }
      })
    },
    // 保存菜单
    handleMenuSave() {
      this.menuLoading = true
      roleMenuUpdate(this.currentRoleId, { menuIds: this.menuIds }).then((res) => {
        this.$message({
          message: '角色菜单分配成功！',
          type: 'success'
        })
        this.menuLoading = false
        const index = this.list.findIndex(v => v.id === this.currentRoleId)
        if (index !== -1) {
          this.list[index].menuIds = []
          for (const menuId of this.menuIds) {
            this.list[index].menuIds.push(menuId)
          }
        }
      })
    },
    // 菜单点击改变状态
    handleMenuChange(menu) {
      const childQuery = Object.assign(JSON.parse(JSON.stringify(defaultMenuListQuery)))
      childQuery.filters.pid = menu.id
      childQuery.filters.depth = 5
      menuList(childQuery).then((res) => {
        const menusData = res.data.records
        this.handleChildMenuIds(menusData, menu.id)
      })
    },
    // 操作子级菜单ID
    handleChildMenuIds(data, checkedId) {
      const childrenDatas = []
      const childernIds = data.map(item => {
        if (item.hasChildren && Array.isArray(item.children)) {
          childrenDatas.push({ id: item.id, children: item.children })
        }
        return item.id
      })
      childernIds.push(checkedId)
      if (this.menuIds.indexOf(checkedId) !== -1) {
        for (let i = 0; i < childernIds.length; i++) {
          const index = this.menuIds.indexOf(childernIds[i])
          if (index !== -1) {
            this.menuIds.splice(index, 1)
          }
        }
      } else {
        for (let i = 0; i < childernIds.length; i++) {
          const index = this.menuIds.indexOf(childernIds[i])
          if (index === -1) {
            this.menuIds.push(childernIds[i])
          }
        }
      }
      if (childrenDatas) {
        childrenDatas.forEach(element => {
          const childrenIndex = this.menuIds.indexOf(element.id)
          if (childrenIndex !== -1) {
            this.menuIds.splice(childrenIndex, 1)
          } else {
            this.menuIds.push(element.id)
          }
          this.handleChildMenuIds(element.children, element.id)
        })
      }
      this.$refs.menuTree.setCheckedKeys(this.menuIds)
    },
    handleSelectionChange(val) {
      this.roleSelections = val
    },
    // 角色单行选中状态的改变
    handleCurrentChange(val) {
      if (val) {
        const _this = this
        this.$refs.menuTree.setCheckedKeys([])
        this.currentRoleId = val.id
        this.menuIds = []
        for (const menuId of val.menuIds) {
          _this.menuIds.push(menuId)
        }
        this.$refs.menuTree.setCheckedKeys(_this.menuIds)
        this.showButton = true
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .role-span {
    font-weight: bold;color: #303133;
    font-size: 15px;
  }
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
 ::v-deep .vue-treeselect__multi-value{
    margin-bottom: 0;
  }
 ::v-deep .vue-treeselect__multi-value-item{
    border: 0;
    padding: 0;
  }
</style>
<style>
.crud-opts {
  width: 100%;
	padding: 4px 0;
	display: -webkit-flex;
	display: flex;
	align-items: center;
}
.crud-opts .crud-opts-right {
	margin-left: auto;
}
.crud-opts .crud-opts-right span {
	float: left;
}
</style>
