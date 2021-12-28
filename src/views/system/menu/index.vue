<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div class="crud-opts">
        <span class="crud-opts-left">
          <el-button v-permission="['menu:create']" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="handleCreate()"> 新增 </el-button>
          <el-button v-permission="['menu:edit']" class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="menuSelections.length !== 1" @click="handleUpdate(menuSelections[0])"> 修改 </el-button>
          <el-popconfirm v-permission="['menu:delete']" :title="`确认删除所选${menuSelections.length}条数据吗？`" @onConfirm="handleDelete(menuSelections[0])">
            <el-button slot="reference" class="filter-item" type="danger" icon="el-icon-delete" size="mini" :disabled="menuSelections.length !== 1"> 删除 </el-button>
          </el-popconfirm>
        </span>
      </div>
    </div>
    <!-- 表格渲染 -->
    <el-table
      ref="menuTable"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      lazy
      :load="getChildrenMenu"
      row-key="id"
      @selection-change="handleSelectionChange"
      @select="handleSelect"
      @select-all="handleSelectAll"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column label="菜单标题" width="160px" prop="title" />
      <el-table-column label="图标" align="center" width="60px" prop="icon">
        <template slot-scope="{ row }">
          <svg-icon :icon-class="row.icon ? row.icon : ''" />
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" width="60px" prop="sort">
        <template slot-scope="{ row }"> {{ row.sort }} </template>
      </el-table-column>
      <el-table-column label="路由地址" prop="path" />
      <el-table-column label="权限标识" width="150px" prop="permission" />
      <el-table-column label="组件名称" width="150px" prop="name" />
      <el-table-column label="组件地址" prop="component" />
      <el-table-column label="外链" align="center" width="75px">
        <template slot-scope="{ row }">
          <span v-if="row.type === 0"> 是 </span>
          <span v-else> 否 </span>
        </template>
      </el-table-column>
      <el-table-column label="目录" align="center" width="75px">
        <template slot-scope="{ row }">
          <span v-if="row.isMenu === 1 || row.isMenu === true"> 是 </span>
          <span v-else> 否 </span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" width="135px" prop="createTime" />
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{ row }">
          <el-button v-permission="['menu:edit']" size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-popconfirm v-permission="['menu:delete']" title="确认删除本条数据吗？" @onConfirm="handleDelete(row)">
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getMenuList()" />
    <!--表单渲染-->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="titleMap[dialogStatus] + '菜单'" width="580px">
      <el-form ref="dataForm" :inline="true" :model="formData" :rules="rules" size="small" label-width="80px">
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type" size="mini" style="width: 178px">
            <el-radio-button label="0">外链</el-radio-button>
            <el-radio-button label="1">菜单</el-radio-button>
            <el-radio-button label="2">动作</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单可见" prop="hidden">
          <el-radio-group v-model="formData.isMenu" size="mini">
            <el-radio-button :label="isTrue">是</el-radio-button>
            <el-radio-button :label="isFalse">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.type.toString() === '1'" label="菜单图标" prop="icon">
          <el-popover placement="bottom-start" width="450" trigger="click" @show="$refs['iconSelect'].reset()">
            <IconSelect ref="iconSelect" @selected="iconSelected" />
            <el-input slot="reference" v-model="formData.icon" style="width: 450px;" placeholder="点击选择图标" readonly>
              <svg-icon v-if="formData.icon" slot="prefix" :icon-class="formData.icon" class="el-input__icon" style="height: 32px;width: 16px;" />
              <i v-else slot="prefix" class="el-icon-search el-input__icon" />
            </el-input>
          </el-popover>
        </el-form-item>
        <el-form-item v-if="formData.type.toString() !== '2'" label="菜单标题" prop="title">
          <el-input v-model="formData.title" placeholder="菜单标题" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-if="formData.type.toString() === '2'" label="请求名称" prop="title">
          <el-input v-model="formData.title" placeholder="请求名称" style="width: 178px;" />
        </el-form-item>
        <el-form-item label="菜单排序" prop="sort">
          <el-input-number v-model.number="formData.sort" :min="0" :max="999" controls-position="right" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-if="formData.type.toString() !== '2'" label="路由地址" prop="path">
          <el-input v-model="formData.path" placeholder="路由地址" :style="formData.type.toString() !== '0' ? 'width: 178px' : 'width: 450px'" />
        </el-form-item>
        <el-form-item v-if="formData.type.toString() !== '0'" label="权限标识" prop="permission">
          <el-input v-model="formData.permission" placeholder="权限标识" style="width: 178px;" />
        </el-form-item>
        <el-form-item v-if="formData.type.toString() === '1'" label="组件名称" prop="name">
          <el-input v-model="formData.name" style="width: 178px;" placeholder="匹配组件内Name字段" />
        </el-form-item>
        <el-form-item v-if="formData.type.toString() === '1'" label="组件路径" prop="component">
          <el-input v-model="formData.component" style="width: 178px;" placeholder="组件路径" />
        </el-form-item>
        <el-form-item label="上级类目" prop="pid">
          <treeselect v-model="formData.pid" :options="categoryOptions" :load-options="loadChildrenMenu" :normalizer="normalizer" style="width: 450px;" :searchable="false" placeholder="选择上级类目" />
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
import { menuCreate, menuDelete, menuList, menuUpdate } from '@/api/system/menu'
import IconSelect from '@/components/IconSelect'
import Pagination from '@/components/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

const defaultListQuery = {
  page: 1,
  size: 20,
  filters: {
    struct: 'tree',
    pid: 0,
    depth: 1
  }
}

const defaultFormData = {
  belongsTo: 'api',
  id: undefined,
  type: 0,
  icon: '',
  isMenu: false,
  title: '',
  permission: '',
  path: '',
  name: '',
  component: '',
  sort: 999,
  pid: null
}

export default {
  name: 'MenuIndex',
  components: { IconSelect, Treeselect, Pagination },
  data() {
    return {
      tableKey: 0,
      menuSelections: [],
      list: [],
      total: 0,
      listLoading: true,
      listQuery: Object.assign(JSON.parse(JSON.stringify(defaultListQuery))),
      dialogStatus: 'create',
      titleMap: {
        'create': '新增',
        'update': '编辑'
      },
      dialogFormVisible: false,
      formData: Object.assign(JSON.parse(JSON.stringify(defaultFormData))),
      rules: {
        title: [{ required: true, message: '请输入标题名称', trigger: 'blur' }],
        path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
        name: [{ required: true, message: '请输入组件名称', trigger: 'blur' }],
        component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }],
        pid: [{ required: true, message: '请选择类目', trigger: 'blur' }]
      },
      categoryOptions: [{ id: 0, title: '顶级类目', children: null }],
      normalizer(node) {
        return {
          id: node.id,
          label: node.title
        }
      },
      isTrue: true,
      isFalse: false
    }
  },
  created() {
    this.getMenuList()
  },
  methods: {
    // 获取菜单列表
    getMenuList() {
      this.listLoading = true
      menuList(this.listQuery).then((res) => {
        this.list = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },
    // 获取下级目录
    getChildrenMenu(tree, treeNode, resolve) {
      const childrenQuery = Object.assign(JSON.parse(JSON.stringify(defaultListQuery)))
      childrenQuery.size = 50
      childrenQuery.filters.pid = tree.id
      setTimeout(() => {
        menuList(childrenQuery).then((res) => {
          resolve(res.data.records)
        })
      }, 100)
    },
    // 加载子目录列表
    loadChildrenMenu({ action, parentNode, callback }) {
      if (action === LOAD_CHILDREN_OPTIONS) {
        const loadQuery = Object.assign(JSON.parse(JSON.stringify(defaultListQuery)))
        loadQuery.size = 50
        loadQuery.filters.pid = parentNode.id
        menuList(loadQuery).then((res) => {
          parentNode.children = res.data.records.map(function(obj) {
            if (obj.hasChildren) {
              obj.children = null
            }
            return obj
          })
          setTimeout(() => {
            callback()
          }, 100)
        })
      }
    },
    // 新增
    handleCreate() {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 修改
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
      this.formData['isMenu'] = this.formData['isMenu'] === 1 ? true : this.formData['isMenu']
      this.formData = Object.assign(this.formData, { id: row.id })
      this.getMenuSelected(row.pid)
    },
    // 获取编辑类目中已选类目
    getMenuSelected(pid) {
      const selectQuery = Object.assign(JSON.parse(JSON.stringify(defaultListQuery)))
      selectQuery.size = 50
      selectQuery.filters.depth = 5
      menuList(selectQuery).then((res) => {
        const menuData = res.data.records
        this.categoryOptions[0].children = menuData
        // this.filterMenus(this.categoryOptions, pid)
      })
    },
    // filterMenus(menus, pid) {
    //   console.log(menus)
    //   console.log(pid)
    //   const menuIndex = menus.findIndex(item => item.id === pid)
    //   if (menuIndex !== -1) {
    //     menuIndex.forEach(element => {
    //       element.children = null
    //     })
    //   }
    //   console.log(menuIndex)
    // },
    // 表格提交
    handleConfirm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            menuCreate(this.formData).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '新增菜单成功！',
                type: 'success'
              })
              this.getMenuList()
            })
          }
          if (this.dialogStatus === 'update') {
            menuUpdate(this.formData).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '编辑菜单成功！',
                type: 'success'
              })
              this.getMenuList()
            })
          }
        }
      })
    },
    // 删除
    handleDelete(row) {
      menuDelete(row.id).then((res) => {
        this.$message({
          message: '删除成功！',
          type: 'success'
        })
        this.getMenuList()
      })
    },
    // 全选框操作
    handleSelect(selection, row) {
    },
    handleSelectAll() {

    },
    handleSelectionChange(val) {
      this.menuSelections = val
    },
    // 选中图标
    iconSelected(name) {
      this.formData.icon = name
    }
  }
}
</script>

<style>
.crud-opts {
	padding: 4px 0;
	display: -webkit-flex;
	display: flex;
	align-items: center;
    margin-left: auto;
    float: left;
}
</style>
<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
 ::v-deep .vue-treeselect__control,::v-deep .vue-treeselect__placeholder,::v-deep .vue-treeselect__single-value {
    height: 30px;
    line-height: 30px;
  }
</style>
