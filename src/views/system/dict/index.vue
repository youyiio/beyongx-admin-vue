<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="6" :md="5" :lg="5" :xl="5" style="margin-bottom: 10px">
        <el-card class="box-card">
          <!--表格渲染-->
          <el-table ref="dictTable" :key="tableKey" v-loading="listLoading" :data="dictList" highlight-current-row style="width: 100%;" @current-change="handleCurrentChange">
            <el-table-column :show-overflow-tooltip="true" label="字典组名" prop="group" />
          </el-table>
          <!--分页组件-->
          <pagination v-show="total > 0" small layout="prev, pager, next" :pager-count="5" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getDictList()" />
        </el-card>
      </el-col>
      <!-- 字典详情列表 -->
      <el-col :xs="24" :sm="24" :md="19" :lg="19" :xl="19">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>字典详情</span>
            <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus" style="float: right;padding: 4px 10px" @click="handleCreate()"> 新增 </el-button>
          </div>
          <dictDetail ref="dictDetail" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import dictDetail from './dictDetail'
import { dictList } from '@/api/system/dict'
import Pagination from '@/components/Pagination'

export default {
  name: 'DictList',
  components: { Pagination, dictDetail },
  data() {
    return {
      tableKey: 0,
      dictList: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        size: 10,
        filters: {}
      }
    }
  },
  created() {
    this.getDictList()
  },
  methods: {
    // 获取字典列表
    getDictList() {
      this.listLoading = true
      dictList(this.listQuery).then((res) => {
        this.dictList = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },
    // 新增字典
    handleCreate() {
      this.$refs.dictDetail.dialogStatus = 'create'
      this.$refs.dictDetail.dialogFormVisible = true
      this.$refs.dictDetail.formData.dictName = this.$refs.dictDetail.dictName
    },
    handleSelectionChange(val) {
      this.dictSelections = val
    },
    handleCurrentChange(val) {
      this.$refs.dictDetail.dictName = ''
      if (val) {
        this.$refs.dictDetail.dictName = val.group
        this.$refs.dictDetail.getDetailList()
      }
    }
  }
}
</script>
