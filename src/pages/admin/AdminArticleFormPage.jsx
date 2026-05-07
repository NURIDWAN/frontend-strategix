import { useNavigate, useParams } from "react-router-dom";
import ArticleForm from "../../components/Admin/Article/ArticleForm";

const AdminArticleFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleBack = () => {
    navigate("/admin/articles");
  };

  return <ArticleForm articleId={id || null} onBack={handleBack} />;
};

export default AdminArticleFormPage;
