<template>
  <div>
    <div v-if="dictName === ''">
      <div class="my-code">点击字典组查看详情</div>
    </div>
    <div v-else>
      <!--表格渲染-->
      <el-table ref="detailTable" v-loading="listLoading" :data="detailList" highlight-current-row style="width: 100%;">
        <el-table-column label="所属字典组" width="150px"> {{ dictName }} </el-table-column>
        <el-table-column label="名称" prop="name" width="150px" />
        <el-table-column label="字典键" prop="key" width="180px" />
        <el-table-column label="字典值" :show-overflow-tooltip="true" prop="value" />
        <el-table-column label="排序" prop="sort" align="center" width="80px" />
        <el-table-column label="操作" width="130px" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(row)" />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination v-show="total > 0" small :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getDetailList()" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogFormVisible" :title="titleMap[dialogStatus] + '字典'" :before-close="handleCloseDialog" width="500px">
      <el-form ref="dataForm" :model="formData" :rules="rules" size="small" label-width="80px">
        <el-form-item label="字典组" prop="dictName">
          <el-input v-model="formData.dictName" :disabled="dialogStatus === 'update'" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="formData.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="字典键" prop="key">
          <el-input v-model="formData.key" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="字典值" prop="value">
          <el-input v-model="formData.value" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model.number="formData.sort" :min="0" :max="999" controls-position="right" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="handleCancelDialog()">取消</el-button>
        <el-button type="primary" @click="handleConfirm()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { detailList, dictCreate, dictDelete, dictUpdate } from '@/api/system/dict'
import Pagination from '@/components/Pagination'

const defaultFormData = {
  id: undefined,
  dictName: '',
  group: '',
  name: '',
  value: '',
  key: '',
  sort: 999
}

export default {
  name: 'DictDetail',
  components: { Pagination },
  data() {
    return {
      dictName: '',
      detailList: [],
      total: 0,
      listQuery: {
        page: 1,
        size: 10,
        filters: {
          group: ''
        }
      },
      listLoading: false,
      dialogFormVisible: false,
      dialogStatus: 'create',
      titleMap: {
        'create': '新增',
        'update': '编辑'
      },
      formData: Object.assign(JSON.parse(JSON.stringify(defaultFormData))),
      rules: {
        dictName: [{ required: true, message: '请输入字典组名', trigger: 'blur' }],
        name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
        value: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
        key: [{ required: true, message: '请输入字典值', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 获取字典列表
    getDetailList() {
      this.listQuery.filters.group = this.dictName
      this.listLoading = true
      detailList(this.listQuery).then((res) => {
        this.detailList = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },
    // 弹窗关闭前的动作
    handleCloseDialog(done) {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      done()
    },
    // 取消弹窗
    handleCancelDialog() {
      this.formData = Object.assign(JSON.parse(JSON.stringify(defaultFormData)))
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.dialogFormVisible = false
    },
    // 编辑字典
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      for (const key in this.formData) {
        this.formData[key] = row[key]
      }
      this.formData = Object.assign(this.formData, { id: row.id, dictName: row.group })
    },
    // 表格提交
    handleConfirm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const saveKey = ['group', 'name', 'key', 'value', 'sort']
          const saveData = {}
          for (const val of saveKey) {
            saveData[val] = this.formData[val]
          }
          saveData['group'] = this.formData.dictName
          if (this.dialogStatus === 'create') {
            dictCreate(saveData).then((res) => {
              this.$message({
                message: '新增字典成功！',
                type: 'success'
              })
              this.listQuery.page = 1
              this.dictName = this.formData.dictName
              this.getDetailList()
              this.dialogFormVisible = false
            })
          }
          if (this.dialogStatus === 'update') {
            saveData['id'] = this.formData.id
            dictUpdate(saveData).then((res) => {
              this.$message({
                message: '编辑字典成功！',
                type: 'success'
              })
              const index = this.detailList.findIndex(v => v.id === this.formData.id)
              if (index !== -1) {
                this.detailList[index].name = this.formData.name
                this.detailList[index].key = this.formData.key
                this.detailList[index].value = this.formData.value
                this.detailList[index].sort = this.formData.sort
              }
              this.dialogFormVisible = false
            })
          }
        }
      })
    },
    // 删除字典
    handleDelete(row) {
      dictDelete(row.id).then((res) => {
        this.$message({
          message: '删除成功！',
          type: 'success'
        })
        const index = this.detailList.findIndex(v => v.id === row.id)
        if (index !== -1) {
          this.detailList.splice(index, 1)
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
</style>
