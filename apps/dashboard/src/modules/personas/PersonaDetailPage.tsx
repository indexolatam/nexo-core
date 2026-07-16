import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Descriptions, Tag, Spin, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { apiRequest } from "../../services/apiClient.js";

type Person = Record<string, any> & { user_id: string; user_name_1: string; user_lastname_1: string; user_phone: string; user_email: string | null; user_status: string };

export function PersonaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiRequest<Person>(`/personas/${id}`).then(setPerson)
      .catch((err) => { message.error(err instanceof Error ? err.message : "Error"); navigate("/admin/personas"); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <Spin size="large" className="block mt-8 text-center" />;
  if (!person) return null;

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/personas")} className="mb-4">Volver</Button>
      <Card title={`${person.user_name_1} ${person.user_lastname_1}`}>
        <Descriptions bordered column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Estado"><Tag color={person.user_status === "Activo" ? "green" : "orange"}>{person.user_status}</Tag></Descriptions.Item>
          <Descriptions.Item label="Teléfono">{person.user_phone}</Descriptions.Item>
          <Descriptions.Item label="Email">{person.user_email || "—"}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
