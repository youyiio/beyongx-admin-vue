<template>
  <div>
    <div v-if="query.dictName === ''">
      <div class="my-code">点击字典查看详情</div>
    </div>
    <div v-else>
      <!--表格渲染-->
      <el-table ref="detailTable" v-loading="listloading" :data="detailList" highlight-current-row style="width: 100%;">
        <el-table-column label="所属字典">
          {{ query.dictName }}
        </el-table-column>
        <el-table-column label="字典标签" />
        <el-table-column label="字典值" />
        <el-table-column label="排序" />
        <el-table-column label="操作" width="130px" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(row)" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      query: { dictName: '' },
      detailList: [],
      listLoading: false
    }
  },
  methods: {
    handleCreate() {

    }
  }
}
</script>
