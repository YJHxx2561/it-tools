<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useQueryParamOrStorage } from '@/composable/queryParams';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const { t } = useI18n();

const apiToken = useQueryParamOrStorage({ name: 'apiToken', storageName: 'cf-pages:token', defaultValue: '' });
const accountId = useQueryParamOrStorage({ name: 'accountId', storageName: 'cf-pages:accountId', defaultValue: '' });
const projectName = useQueryParamOrStorage({ name: 'projectName', storageName: 'cf-pages:projectName', defaultValue: '' });

interface FileToUpload {
  file: File
  uploaded: boolean
  error: string
}

const selectedFiles = ref<FileToUpload[]>([]);
const deploymentResult = ref<{ id: string, url: string, error: string } | null>(null);
const isDeploying = ref(false);

async function deployToCloudflarePages() {
  if (!apiToken.value || !accountId.value || !projectName.value || selectedFiles.value.length === 0) {
    return;
  }

  isDeploying.value = true;
  deploymentResult.value = null;

  try {
    // Create a new deployment
    const createResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId.value}/pages/projects/${projectName.value}/deployments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branch: 'main',
          buildConfig: {
            buildCommand: null,
            destination: {
              kind: 'production',
            },
            rootDist: '.',
          },
          metadata: {
            commitMessage: 'Deployed via IT Tools',
          },
        }),
      },
    );

    const createData = await createResponse.json();

    if (!createData.success) {
      deploymentResult.value = {
        id: '',
        url: '',
        error: createData.errors?.[0]?.message || 'Failed to create deployment',
      };
      isDeploying.value = false;
      return;
    }

    const deploymentId = createData.result.id;
    const uploadUrl = createData.result.uploadUrl;

    // Upload files
    for (const fileToUpload of selectedFiles.value) {
      try {
        const fileResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          body: fileToUpload.file,
        });

        if (!fileResponse.ok) {
          fileToUpload.error = `Failed to upload ${fileToUpload.file.name}`;
        }
        else {
          fileToUpload.uploaded = true;
        }
      }
      catch (err: any) {
        fileToUpload.error = err.message;
      }
    }

    // Mark deployment as ready
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId.value}/pages/projects/${projectName.value}/deployments/${deploymentId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${apiToken.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checked: true,
        }),
      },
    );

    const deploymentUrl = `https://${projectName.value}.pages.dev`;

    deploymentResult.value = {
      id: deploymentId,
      url: deploymentUrl,
      error: '',
    };
  }
  catch (err: any) {
    deploymentResult.value = {
      id: '',
      url: '',
      error: err.toString(),
    };
  }

  isDeploying.value = false;
}

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    selectedFiles.value = Array.from(target.files).map(file => ({
      file,
      uploaded: false,
      error: '',
    }));
  }
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
</script>

<template>
  <div>
    <c-card :title="t('tools.cloudflare-pages-deployer.texts.title-configuration')">
      <c-input-text
        v-model:value="apiToken"
        :label="t('tools.cloudflare-pages-deployer.texts.label-api-token')"
        :placeholder="t('tools.cloudflare-pages-deployer.texts.placeholder-api-token')"
        type="password"
        mb-2
      />

      <c-input-text
        v-model:value="accountId"
        :label="t('tools.cloudflare-pages-deployer.texts.label-account-id')"
        :placeholder="t('tools.cloudflare-pages-deployer.texts.placeholder-account-id')"
        mb-2
      />

      <c-input-text
        v-model:value="projectName"
        :label="t('tools.cloudflare-pages-deployer.texts.label-project-name')"
        :placeholder="t('tools.cloudflare-pages-deployer.texts.placeholder-project-name')"
        mb-2
      />
    </c-card>

    <c-card :title="t('tools.cloudflare-pages-deployer.texts.title-files')" mt-4>
      <n-upload
        multiple
        directory-dnd
        @change="onFileSelect"
      >
        <n-upload-dragger>
          <div py-4>
            <p mt-2>
              {{ t('tools.cloudflare-pages-deployer.texts.title-drag-and-drop-files-here-or-click-to-select') }}
            </p>
          </div>
        </n-upload-dragger>
      </n-upload>

      <div v-if="selectedFiles.length > 0" mt-4>
        <n-list hoverable clickable>
          <n-list-item v-for="(fileToUpload, index) in selectedFiles" :key="index">
            <n-thing :title="fileToUpload.file.name" :description="formatFileSize(fileToUpload.file.size)" />
            <template #suffix>
              <n-tag v-if="fileToUpload.uploaded" type="success">
                {{ t('tools.cloudflare-pages-deployer.texts.tag-uploaded') }}
              </n-tag>
              <n-tag v-else-if="fileToUpload.error" type="error">
                {{ t('tools.cloudflare-pages-deployer.texts.tag-error') }}
              </n-tag>
              <n-button size="small" quaternary @click="removeFile(index)">
                X
              </n-button>
            </template>
          </n-list-item>
        </n-list>
      </div>
    </c-card>

    <div mt-4 flex justify-center>
      <c-button
        :disabled="!apiToken || !accountId || !projectName || selectedFiles.length === 0 || isDeploying"
        :loading="isDeploying"
        @click="deployToCloudflarePages"
      >
        {{ t('tools.cloudflare-pages-deployer.texts.tag-deploy') }}
      </c-button>
    </div>

    <c-alert v-if="deploymentResult?.error" type="error" mt-4 :title="t('tools.cloudflare-pages-deployer.texts.title-error')">
      <TextareaCopyable :value="deploymentResult.error" copy-placement="none" />
    </c-alert>

    <c-card v-if="deploymentResult && !deploymentResult.error" mt-4 :title="t('tools.cloudflare-pages-deployer.texts.title-deployment-successful')">
      <nDescriptions label-placement="top">
        <nDescriptions-item :label="t('tools.cloudflare-pages-deployer.texts.label-deployment-id')">
          <TextareaCopyable :value="deploymentResult.id" />
        </nDescriptions-item>
        <nDescriptions-item :label="t('tools.cloudflare-pages-deployer.texts.label-deployment-url')">
          <a :href="deploymentResult.url" target="_blank" rel="noopener" class="text-primary">
            {{ deploymentResult.url }}
          </a>
        </nDescriptions-item>
      </nDescriptions>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
</style>
