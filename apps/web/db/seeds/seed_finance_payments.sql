INSERT OR IGNORE INTO finance_movements (id, persona_id, persona_nombre, servicio, service_id, monto, metodo_pago, estado, fecha, hora, referencia_transaccion, banco_id, observaciones, tipo_movimiento, created_at, updated_at) VALUES

('fin-101', 'per-001', 'Ana Pérez', 'Consulta individual', 'consulta-individual', 30, 'Efectivo', 'Pagado', '2026-06-01', '10:00', NULL, NULL, 'Pago en efectivo al finalizar sesión', 'ingreso', '2026-06-01T10:00:00.000Z', '2026-06-01T10:00:00.000Z'),

('fin-201', 'per-002', 'Empresa ABC', 'Taller bienestar laboral', 'terapia-familiar', 50, 'Transferencia', 'Pagado', '2026-06-03', '15:30', 'TRF-ABC-001', 'bank-bac', 'Pago corporativo transferencia mensual', 'ingreso', '2026-06-03T15:30:00.000Z', '2026-06-03T15:30:00.000Z'),

('fin-601', 'per-006', 'Lucía Ramírez', 'Terapia familiar', 'terapia-familiar', 50, 'Efectivo', 'Pagado', '2026-06-05', '17:30', NULL, NULL, 'Pago en efectivo', 'ingreso', '2026-06-05T17:30:00.000Z', '2026-06-05T17:30:00.000Z'),

('fin-701', 'per-007', 'Pedro Díaz', 'Consulta individual', 'consulta-individual', 30, 'Efectivo', 'Pagado', '2026-03-25', '10:00', NULL, NULL, 'Pago en efectivo', 'ingreso', '2026-03-25T10:00:00.000Z', '2026-03-25T10:00:00.000Z'),

('fin-702', 'per-007', 'Pedro Díaz', 'Consulta individual', 'consulta-individual', 30, 'Efectivo', 'Pagado', '2026-04-08', '10:00', NULL, NULL, 'Pago en efectivo', 'ingreso', '2026-04-08T10:00:00.000Z', '2026-04-08T10:00:00.000Z'),

('fin-103', 'per-001', 'Ana Pérez', 'Consulta individual', 'consulta-individual', 30, 'Transferencia', 'Pendiente', '2026-06-22', '10:00', NULL, 'bank-lafise', 'Pendiente de pago - sesión remota', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-202', 'per-002', 'Empresa ABC', 'Taller bienestar laboral', 'terapia-familiar', 50, 'Transferencia', 'Pendiente', '2026-06-17', '15:30', NULL, 'bank-bac', 'Factura corporativa pendiente', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-203', 'per-002', 'Empresa ABC', 'Taller bienestar laboral', 'terapia-familiar', 50, 'Transferencia', 'Pendiente', '2026-07-01', '15:30', NULL, 'bank-bac', 'Factura corporativa pendiente', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-301', 'per-003', 'Carlos Pérez', 'Consulta individual', 'consulta-individual', 30, 'Efectivo', 'Pendiente', '2026-06-15', '11:00', NULL, NULL, 'Pago acordado al finalizar sesión', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-302', 'per-003', 'Carlos Pérez', 'Consulta individual', 'consulta-individual', 30, 'Efectivo', 'Pendiente', '2026-06-22', '11:00', NULL, NULL, 'Pago pendiente', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-303', 'per-003', 'Carlos Pérez', 'Consulta individual', 'consulta-individual', 30, 'Efectivo', 'Pendiente', '2026-06-29', '11:00', NULL, NULL, 'Pago pendiente', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-401', 'per-004', 'María García', 'Consulta individual', 'consulta-individual', 30, 'Efectivo', 'Pendiente', '2026-06-16', '12:00', NULL, NULL, 'Pago al finalizar valoración', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-402', 'per-004', 'María García', 'Consulta individual', 'consulta-individual', 30, 'Tarjeta', 'Pendiente', '2026-06-23', '12:00', NULL, NULL, 'Pagará con tarjeta', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-403', 'per-004', 'María García', 'Consulta individual', 'consulta-individual', 30, 'Efectivo', 'Pendiente', '2026-06-30', '12:00', NULL, NULL, 'Pago pendiente', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-501', 'per-005', 'Juan Martínez', 'Consulta individual', 'consulta-individual', 30, 'Transferencia', 'Pendiente', '2026-06-18', '16:00', NULL, 'bank-lafise', 'Transferencia bancaria pendiente', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-502', 'per-005', 'Juan Martínez', 'Consulta individual', 'consulta-individual', 30, 'Efectivo', 'Pendiente', '2026-06-25', '16:00', NULL, NULL, 'Pago pendiente', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-503', 'per-005', 'Juan Martínez', 'Consulta individual', 'consulta-individual', 30, 'Efectivo', 'Pendiente', '2026-07-02', '16:00', NULL, NULL, 'Pago pendiente', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-603', 'per-006', 'Lucía Ramírez', 'Terapia familiar', 'terapia-familiar', 50, 'Transferencia', 'Pendiente', '2026-06-26', '17:30', NULL, 'bank-lafise', 'Pago pendiente', 'ingreso', '2026-06-14T00:00:00.000Z', '2026-06-14T00:00:00.000Z'),

('fin-c-001', 'per-001', 'Ana Pérez', 'Consulta individual', 'consulta-individual', 30, 'Efectivo', 'Cancelado', '2026-06-01', '10:00', NULL, NULL, 'ERROR DE COBRO: Se registró como pagado pero el efectivo nunca se recibió. Corregido el 02/06.', 'ingreso', '2026-06-01T10:00:00.000Z', '2026-06-02T10:00:00.000Z'),

('fin-c-002', 'per-003', 'Carlos Pérez', 'Consulta individual', 'consulta-individual', 30, 'Transferencia', 'Cancelado', '2026-06-10', '11:30', 'TRF-ERR-001', 'bank-bac', 'ERROR DE COBRO: Transferencia rechazada por fondos insuficientes. Se canceló el registro.', 'ingreso', '2026-06-10T11:30:00.000Z', '2026-06-10T12:00:00.000Z'),

('fin-c-003', 'per-002', 'Empresa ABC', 'Taller bienestar laboral', 'terapia-familiar', 50, 'Transferencia', 'Cancelado', '2026-06-03', '16:00', 'TRF-ABC-ERR', 'bank-bac', 'ERROR DE COBRO: Se registró doble pago para la misma sesión. Se cancela este registro duplicado.', 'ingreso', '2026-06-03T16:00:00.000Z', '2026-06-04T09:00:00.000Z');
