export interface LineItem {
  SalesOrderID: number;
  SalesOrderDetailID: number;
  CarrierTrackingNumber: string | null;
  OrderQty: number;
  ProductID: number;
  SpecialOfferID: number;
  UnitPrice: number;
  UnitPriceDiscount: number;
  LineTotal: number;
  ModifiedDate: string;
}

export interface Order {
  SalesOrderID: number;
  RevisionNumber: number;
  OrderDate: string;
  DueDate: string;
  ShipDate: string | null;
  Status: number;
  OnlineOrderFlag: boolean;
  SalesOrderNumber: string;
  PurchaseOrderNumber: string | null;
  AccountNumber: string | null;
  CustomerID: number;
  SalesPersonID: number | null;
  TerritoryID: number | null;
  BillToAddressID: number | null;
  ShipToAddressID: number | null;
  ShipMethodID: number | null;
  CreditCardID: number | null;
  CreditCardApprovalCode: string | null;
  CurrencyRateID: number | null;
  SubTotal: number;
  TaxAmt: number;
  Freight: number;
  TotalDue: number;
  ModifiedDate: string;
  lines: LineItem[];
}

// For backward compatibility
export type Header = Omit<Order, 'lines'>;
export type Line = LineItem;
