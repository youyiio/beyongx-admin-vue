<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div class="crud-opts">
        <span class="crud-opts-left">
          <el-button v-permission="['job:create']" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="handleCreate()"> 新增 </el-button>
          <el-button v-permission="['job:update']" class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="jobSelections.length !== 1" @click="handleUpdate(jobSelections[0])"> 修改 </el-button>
          <el-popconfirm v-permission="['job:delete']" :title="`确认删除所选${jobSelections.length}条数据吗？`" @onConfirm="handleDelete(jobSelections[0])">
            <el-button slot="reference" class="filter-item" type="danger" icon="el-icon-delete" size="mini" :disabled="jobSelections.length !== 1"> 删除 </el-button>
          </el-popconfirm>
        </span>
      </div>
    </div>
    <!-- 表格渲染 -->
    <el-table ref="jobTable" :key="tableKey" v-loading="listLoading" :data="list" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column label="岗位名称" width="150px" prop="title" />
      <el-table-column label="英文标识" width="150px" prop="name" />
      <el-table-column label="描述" :show-overflow-tooltip="true" prop="remark" />
      <el-table-column label="排序" align="center" width="60px" prop="sort">
        <template slot-scope="{ row }"> {{ row.sort }} </template>
      </el-table-column>
      <el-table-column label="创建日期" width="135px" prop="createTime" />
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{ row }">
          <el-button v-permission="['job:update']" size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-popconfirm v-permission="['job:delete']" title="确认删除本条数据吗？" @onConfirm="handleDelete(row)">
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getJobList()" />
    <!--表单渲染-->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="titleMap[dialogStatus] + '岗位'" width="580px">
      <el-form ref="dataForm" :model="formData" :rules="rules" size="small" label-width="80px">
        <el-form-item label="岗位名称" prop="title">
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { jobCreate, jobDelete, jobList, jobUpdate } from '@/api/system/job'
import Pagination from '@/components/Pagination'

const defaultFormData = {
  id: undefined,
  title: '',
  name: '',
  remark: '',
  sort: 999
}

export default {
  name: 'JobList',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      jobSelections: [],
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 20,
        filters: {}
      },
      dialogStatus: 'create',
      titleMap: {
        'create': '新增',
        'update': '编辑'
      },
      dialogFormVisible: false,
      formData: Object.assign(JSON.parse(JSON.stringify(defaultFormData))),
      rules: {
        title: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
        name: [{ required: true, message: '请输入英文标识', trigger: 'blur' }],
        remark: [{ required: true, message: '请输入描述', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getJobList()
  },
  methods: {
    // 获取岗位列表
    getJobList() {
      this.listLoading = true
      jobList(this.listQuery).then((res) => {
        this.list = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },
    // 新增岗位
    handleCreate() {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 编辑岗位
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
            jobCreate(this.formData).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '新增部门成功！',
                type: 'success'
              })
              this.getJobList()
            })
          }
          if (this.dialogStatus === 'update') {
            jobUpdate(this.formData).then((res) => {
              this.dialogFormVisible = false
              this.$message({
                message: '编辑部门成功！',
                type: 'success'
              })
              const index = this.list.findIndex(v => v.id === this.formData.id)
              if (index !== -1) {
                this.list[index].title = this.formData.title
                this.list[index].name = this.formData.name
                this.list[index].remark = this.formData.remark
                this.list[index].sort = this.formData.sort
              }
            })
          }
        }
      })
    },
    // 删除岗位
    handleDelete(row) {
      jobDelete(row.id).then((res) => {
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
    handleSelectionChange(val) {
      this.jobSelections = val
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
