import api, { unwrap } from './api';

/**
 * Tier-2 generic CRUD service — backs Masters, Invoices, Payments, Imports, KYC,
 * Accounting and Settings skeleton pages against loosely-typed backend collections,
 * per CONTRACT.md ("generic CRUD against a loosely-typed Mongoose model per key").
 */
export function createGenericService(basePath) {
  return {
    list: (params) => unwrap(api.get(basePath, { params })),
    get: (id) => unwrap(api.get(`${basePath}/${id}`)),
    create: (payload) => unwrap(api.post(basePath, payload)),
    update: (id, payload) => unwrap(api.patch(`${basePath}/${id}`, payload)),
    remove: (id) => unwrap(api.delete(`${basePath}/${id}`)),
  };
}

export const mastersService = (key) => createGenericService(`/masters/${key}`);
export const invoicesService = createGenericService('/invoices');
export const paymentsService = createGenericService('/payments');
export const kycService = createGenericService('/kyc');
export const accountingService = (key) => createGenericService(`/accounting/${key}`);
export const settingsService = (key) => createGenericService(`/settings/${key}`);

export function importFile(key, file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  return unwrap(
    api.post(`/imports/${key}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded * 100) / evt.total));
      },
    })
  );
}
