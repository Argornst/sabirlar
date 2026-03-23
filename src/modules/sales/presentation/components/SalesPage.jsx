import { Link } from "react-router-dom";
import { ROUTES } from "../../../../shared/constants/routes";
import { useSalesListQuery } from "../hooks/useSalesListQuery";
import SalesTable from "../components/SalesTable";

export default function SalesPage() {
  const { data, isLoading, isError, error } = useSalesListQuery();

  return (
    <section className="page-card">
      <div className="page-card__header">
        <div>
          <h3>Sales</h3>
          <p>Satış kayıtları listesi</p>
        </div>

        <Link to={ROUTES.NEW_SALE} className="primary-button">
          Yeni Satış
        </Link>
      </div>

      {isLoading ? (
        <div className="helper-text">Satışlar yükleniyor...</div>
      ) : null}

      {isError ? (
        <div className="error-text">
          {error?.message || "Satışlar yüklenirken hata oluştu."}
        </div>
      ) : null}

      {!isLoading && !isError ? <SalesTable sales={data ?? []} /> : null}
    </section>
  );
}