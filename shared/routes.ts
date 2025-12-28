import { z } from 'zod';
import { 
  insertPatientSchema, 
  insertInventorySchema, 
  insertAppointmentSchema, 
  insertTreatmentSchema, 
  insertInvoiceSchema,
  patients,
  inventory,
  appointments,
  treatments,
  invoices
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  patients: {
    list: {
      method: 'GET' as const,
      path: '/api/patients',
      input: z.object({
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof patients.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/patients/:id',
      responses: {
        200: z.custom<typeof patients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/patients',
      input: insertPatientSchema,
      responses: {
        201: z.custom<typeof patients.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/patients/:id',
      input: insertPatientSchema.partial(),
      responses: {
        200: z.custom<typeof patients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  inventory: {
    list: {
      method: 'GET' as const,
      path: '/api/inventory',
      responses: {
        200: z.array(z.custom<typeof inventory.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/inventory',
      input: insertInventorySchema,
      responses: {
        201: z.custom<typeof inventory.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/inventory/:id',
      input: insertInventorySchema.partial(),
      responses: {
        200: z.custom<typeof inventory.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  appointments: {
    list: {
      method: 'GET' as const,
      path: '/api/appointments',
      input: z.object({
        date: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof appointments.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/appointments',
      input: insertAppointmentSchema,
      responses: {
        201: z.custom<typeof appointments.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/appointments/:id',
      input: insertAppointmentSchema.partial(),
      responses: {
        200: z.custom<typeof appointments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  treatments: {
    list: {
      method: 'GET' as const,
      path: '/api/treatments',
      input: z.object({
        patientId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof treatments.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/treatments',
      input: insertTreatmentSchema,
      responses: {
        201: z.custom<typeof treatments.$inferSelect>(),
      },
    },
  },
  invoices: {
    list: {
      method: 'GET' as const,
      path: '/api/invoices',
      responses: {
        200: z.array(z.custom<typeof invoices.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/invoices',
      input: insertInvoiceSchema,
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/invoices/:id',
      input: insertInvoiceSchema.partial(),
      responses: {
        200: z.custom<typeof invoices.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  xrays: {
    list: {
      method: 'GET' as const,
      path: '/api/xrays',
      input: z.object({
        patientId: z.coerce.number(),
      }),
      responses: {
        200: z.array(z.custom<any>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/xrays',
      input: z.object({
        patientId: z.coerce.number(),
        url: z.string(),
        description: z.string().optional(),
      }),
      responses: {
        201: z.custom<any>(),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
