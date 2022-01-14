<template>
  <div class="app-container">
    <div class="head-container">
      <div class="crud-opts">
        <span class="crud-opts-left">
          <el-button v-permission="['category:create']" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="handleCreate()"> 新增 </el-button>
          <el-button v-permission="['category:edit']" class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="categorySelections.length !== 1" @click="handleUpdate(categorySelections[0])"> 修改 </el-button>
          <el-popconfirm v-permission="['category:delete']" :title="`确认删除所选${categorySelections.length}条数据吗？`" @confirm="handleDelete(categorySelections[0])">
            <el-button slot="reference" class="filter-item" type="danger" icon="el-icon-delete" size="mini" :disabled="categorySelections.length !== 1"> 删除 </el-button>
          </el-popconfirm>
        </span>
      </div>
    </div>
    <!-- 表格渲染 -->
    <el-table ref="categoryTable" :key="tableKey" v-loading="listLoading" :data="list" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" row-key="id" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column type="" label="ID" prop="id" align="center" width="80" />
      <el-table-column label="分类名称" prop="title" />
      <el-table-column label="英文名称" prop="name" />
      <el-table-column label="备注" prop="remark" />
      <el-table-column label="状态" align="center" prop="enabled">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.enabled" active-color="#409EFF" inactive-color="#F56C6C" @change="changeEnabled(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{ row }">
          <el-button v-permission="['category:edit']" size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-popconfirm v-permission="['category:delete']" style="margin-left: 10px" title="确认删除本条数据吗？" @confirm="handleDelete(row)">
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="titleMap[dialogStatus] + '分类'" width="500px">
      <el-form ref="dataForm" inline :model="formData" :rules="rules" size="small" label-width="80px">
        <el-form-item label="分类名称" prop="title">
          <el-input v-model="formData.title" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="英文名称" prop="name">
          <el-input v-model="formData.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="分类排序" prop="sort">
          <el-input-number v-model.number="formData.sort" :min="0" :max="999" controls-position="right" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="顶级分类">
          <el-radio-group v-model="formData.isTop" style="width: 140px">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio v-for="item in statusMap" :key="item.id" v-model="formData.status" :label="item.value">{{ item.label }}</el-radio>
        </el-form-item>
        <el-form-item v-if="formData.isTop === '0'" style="margin-bottom: 0;" label="上级分类" prop="pid">
          <treeselect v-model="formData.pid" :options="categoryOptions" :normalizer="normalizer" :searchable="false" style="width: 370px;" placeholder="选择上级类目" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm()">确认</el-button>
      </div>
    </el-dialog>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getCategoryList()" />
  </div>
</template>

<script>
import { categoryList, categoryCreate, categoryUpdate, categoryDelete, categoryStatus } from '@/api/cms/category'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { filterTree } from '@/utils'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

const defaultFormData = { id: undefined, title: '', name: '', remark: '', isTop: '1', sort: 999, status: 1, pid: null }

export default {
  name: 'CategoryIndex',
  components: { Treeselect, Pagination },
  data() {
    return {
      tableKey: 0,
      categorySelections: [],
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 20,
        filters: {
          struct: 'tree',
          pid: 0,
          depth: 5
        }
      },
      dialogStatus: 'create',
      titleMap: {
        'create': '新增',
        'update': '编辑'
      },
      dialogFormVisible: false,
      formData: {},
      statusMap: [
        { id: 1, label: '上线', value: 1 },
        { id: 2, label: '下线', value: 0 }
      ],
      categoryOptions: [],
      normalizer(node) {
        return {
          id: node.id,
          label: node.title,
          children: node.children
        }
      },
      rules: {
        title: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      }
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    // 列表数据增加状态属性
    setStatusEnabled(arr) {
      arr.forEach(item => {
        item.enabled = true
        if (item.status !== 1) {
          item.enabled = false
        }
        if (item.children) {
          this.setStatusEnabled(item.children)
        }
      })
      return arr
    },
    // 获取分类列表
    getCategoryList() {
      this.listLoading = true
      categoryList(this.listQuery).then((res) => {
        const listData = this.setStatusEnabled(res.data.records)
        this.list = filterTree(listData, false)
        this.total = res.data.total
        this.listLoading = false
      })
    },

    // 更改状态
    changeEnabled(row) {
      const setParams = {
        id: row.id,
        status: row.status === 1 ? 0 : 1
      }
      categoryStatus(setParams).then((res) => {
        this.$message({
          message: (setParams['status'] === 1 ? '上线' : '下线') + '成功！',
          type: 'success'
        })
        row.status = setParams['status']
      })
    },

    // 新增分类
    handleCreate() {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.categoryOptions = this.list
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    // 编辑分类
    handleUpdate(row) {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.categoryOptions = this.list
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      for (const key in row) {
        this.formData[key] = row[key]
      }
      if (row['pid'] > 0) {
        this.formData['isTop'] = '0'
      } else {
        this.formData['pid'] = null
      }
    },

    // 表单提交
    handleConfirm() {
      const paramsKey = ['title', 'name', 'remark', 'sort', 'status']
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const categoryParams = {}
          for (const val of paramsKey) {
            categoryParams[val] = this.formData[val]
          }
          if (this.formData['isTop'] === '1') {
            categoryParams['pid'] = 0
          } else {
            categoryParams['pid'] = this.formData['pid']
          }
          if (this.dialogStatus === 'create') {
            categoryCreate(categoryParams).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '新增分类成功！',
                type: 'success'
              })
              this.getCategoryList()
            })
          }
          if (this.dialogStatus === 'update') {
            categoryParams['id'] = this.formData['id']
            categoryUpdate(categoryParams).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '编辑分类成功！',
                type: 'success'
              })
              this.getCategoryList()
            })
          }
        }
      })
    },

    // 删除分类
    handleDelete(row) {
      categoryDelete(row.id).then((response) => {
        this.$message({
          message: '删除成功！',
          type: 'success'
        })
        this.getCategoryList()
      })
    },

    handleSelectionChange(val) {
      this.categorySelections = val
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
 ::v-deep .vue-treeselect__control,::v-deep .vue-treeselect__placeholder,::v-deep .vue-treeselect__single-value {
    height: 30px;
    line-height: 30px;
  }
</style>
<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
</style>
