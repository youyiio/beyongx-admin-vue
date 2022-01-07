<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div class="crud-opts">
        <span class="crud-opts-left">
          <el-button v-permission="['dept:create']" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="handleCreate()"> 新增 </el-button>
          <el-button v-permission="['dept:edit']" class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="deptSelections.length !== 1" @click="handleUpdate(deptSelections[0])"> 修改 </el-button>
          <el-popconfirm v-permission="['dept:delete']" :title="`确认删除所选${deptSelections.length}条数据吗？`" @onConfirm="handleDelete(deptSelections[0])">
            <el-button slot="reference" class="filter-item" type="danger" icon="el-icon-delete" size="mini" :disabled="deptSelections.length !== 1"> 删除 </el-button>
          </el-popconfirm>
        </span>
      </div>
    </div>
    <!-- 表格渲染 -->
    <el-table
      ref="deptTable"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      lazy
      :load="getChildrenDept"
      row-key="id"
      @selection-change="handleSelectionChange"
      @select="handleSelect"
      @select-all="handleSelectAll"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column label="部门名称" width="150px" prop="title" />
      <el-table-column label="英文标识" width="150px" prop="name" />
      <el-table-column label="描述" :show-overflow-tooltip="true" prop="remark" />
      <el-table-column label="排序" align="center" width="60px" prop="sort">
        <template slot-scope="{ row }"> {{ row.sort }} </template>
      </el-table-column>
      <el-table-column label="创建日期" width="135px" prop="createTime" />
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{ row }">
          <el-button v-permission="['dept:edit']" size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-popconfirm v-permission="['dept:delete']" style="margin-left: 10px" title="确认删除本条数据吗？" @onConfirm="handleDelete(row)">
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getDeptList()" />
    <!--表单渲染-->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="titleMap[dialogStatus] + '部门'" width="580px">
      <el-form ref="dataForm" :model="formData" :rules="rules" size="small" label-width="80px">
        <el-form-item label="部门名称" prop="title">
          <el-input v-model="formData.title" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="英文标识" prop="name">
          <el-input v-model="formData.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="formData.remark" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="菜单排序" prop="sort">
          <el-input-number v-model.number="formData.sort" :min="0" :max="999" controls-position="right" style="width: 178px;" />
        </el-form-item>
        <el-form-item label="上级部门" prop="pid">
          <treeselect v-model="formData.pid" :options="deptOptions" :load-options="loadChildrenDept" :normalizer="normalizer" style="width: 450px;" :searchable="false" placeholder="选择上级部门" />
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
import { deptCreate, deptDelete, deptList, deptUpdate } from '@/api/system/dept'
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
  id: undefined,
  title: '',
  name: '',
  remark: '',
  sort: 999,
  pid: null
}

export default {
  name: 'DeptIndex',
  components: { Pagination, Treeselect },
  data() {
    return {
      tableKey: 0,
      deptSelections: [],
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
        title: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
        name: [{ required: true, message: '请输入英文标识', trigger: 'blur' }],
        remark: [{ required: true, message: '请输入描述', trigger: 'blur' }],
        pid: [{ required: true, message: '请选择上级部门', trigger: 'blur' }]
      },
      deptOptions: [{ id: 0, title: '顶级部门', children: null }],
      normalizer(node) {
        return {
          id: node.id,
          label: node.title,
          children: node.children
        }
      }
    }
  },
  created() {
    this.getDeptList()
  },
  methods: {
    // 获取部门列表
    getDeptList() {
      this.listLoading = true
      deptList(this.listQuery).then((res) => {
        this.list = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },
    // 获取下级目录
    getChildrenDept(tree, treeNode, resolve) {
      const childrenQuery = Object.assign(JSON.parse(JSON.stringify(defaultListQuery)))
      childrenQuery.size = 50
      childrenQuery.filters.pid = tree.id
      setTimeout(() => {
        deptList(childrenQuery).then((res) => {
          resolve(res.data.records)
        })
      }, 100)
    },
    // 加载子目录列表
    loadChildrenDept({ action, parentNode, callback }) {
      if (action === LOAD_CHILDREN_OPTIONS) {
        const loadQuery = Object.assign(JSON.parse(JSON.stringify(defaultListQuery)))
        loadQuery.size = 50
        loadQuery.filters.pid = parentNode.id
        deptList(loadQuery).then((res) => {
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
    // 新增部门
    handleCreate() {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 编辑部门
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
      this.getDeptSelected(row.pid)
    },
    // 获取编辑类目中已选类目
    getDeptSelected(pid) {
      const selectQuery = Object.assign(JSON.parse(JSON.stringify(defaultListQuery)))
      selectQuery.size = 50
      selectQuery.filters.depth = 5
      deptList(selectQuery).then((res) => {
        const deptData = res.data.records
        this.deptOptions[0].children = deptData
      })
    },
    // 表格提交
    handleConfirm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dialogStatus === 'create') {
            deptCreate(this.formData).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '新增部门成功！',
                type: 'success'
              })
              this.getDeptList()
            })
          }
          if (this.dialogStatus === 'update') {
            deptUpdate(this.formData).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '编辑部门成功！',
                type: 'success'
              })
              this.getDeptList()
            })
          }
        }
      })
    },
    // 删除部门
    handleDelete(row) {
      deptDelete(row.id).then((res) => {
        this.$message({
          message: '删除成功！',
          type: 'success'
        })
        this.getDeptList()
      })
    },
    // 全选框操作
    handleSelect(selection, row) {
    },
    handleSelectAll() {

    },
    handleSelectionChange(val) {
      this.deptSelections = val
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
