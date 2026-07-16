import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button, Space, Tag, Typography, Modal, Form, message } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { apiRequest } from "../../services/apiClient.js";

type Person = { user_id: string; user_name_1: string; user_lastname_1: string; user_phone: string; user_email: string | null; user_status: string; user_types: string };
type PersonsRes = { data: Person[]; pagination: { page: number; limit: number; total: number; totalPages: number } };

export function PersonasPage() {
  const navigate = useNavigate();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchPersons = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await apiRequest<PersonsRes>(`/personas?${params}`);
      setPersons(res.data); setPagination(res.pagination);
    } catch (err) { message.error(err instanceof Error ? err.message : "Error"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchPersons(1); }, [fetchPersons]);

  const handleCreate = async (values: Record<string, unknown>) => {
    try { await apiRequest("/personas", { method: "POST", body: values }); message.success("Creada"); setModalOpen(false); form.resetFields(); fetchPersons(1); }
    catch (err) { message.error(err instanceof Error ? err.message : "Error"); }
  };

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: "Eliminar", content: `¿Eliminar a ${name}?`, okText: "Eliminar", okType: "danger",
      onOk: async () => { try { await apiRequest(`/personas/${id}`, { method: "DELETE" }); message.success("Eliminada"); fetchPersons(pagination.page); } catch (err) { message.error(err instanceof Error ? err.message : "Error"); } },
    });
  };

  const columns = [
    { title: "Nombre", key: "name", render: (_: any, r: Person) => `${r.user_name_1} ${r.user_lastname_1}` },
    { title: "Teléfono", dataIndex: "user_phone" },
    { title: "Email", dataIndex: "user_email", render: (v: string | null) => v || "—" },
    { title: "Estado", dataIndex: "user_status", render: (v: string) => <Tag color={v === "Activo" ? "green" : "orange"}>{v}</Tag> },
    { title: "Acciones", key: "actions", width: 100, render: (_: any, r: Person) => (
      <Space>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/admin/personas/${r.user_id}`)} />
        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.user_id, `${r.user_name_1} ${r.user_lastname_1}`)} />
      </Space>
    )},
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography.Title level={4} className="!mb-0">Personas</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Nueva</Button>
      </div>
      <Space className="mb-4">
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={() => fetchPersons(1)} style={{ width: 250 }} allowClear />
      </Space>
      <Table columns={columns} dataSource={persons} rowKey="user_id" loading={loading}
        pagination={{ current: pagination.page, pageSize: pagination.limit, total: pagination.total, onChange: (p) => fetchPersons(p) }} />
      <Modal title="Nueva persona" open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields(); }} onOk={() => form.submit()} okText="Crear">
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="user_name_1" label="Nombre" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="user_lastname_1" label="Apellido" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="user_phone" label="Teléfono" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="user_email" label="Email"><Input type="email" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
