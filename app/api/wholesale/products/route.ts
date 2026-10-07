import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { prisma } from "@/app/lib/prisma";
import { getUserSession } from "@/app/lib/user-auth";

function allowed(role: string) {
  return ["WHOLESALER", "MANUFACTURER"].includes(role);
}

function numberValue(value: unknown, fallback = 0) {
  const n = Number(
    typeof value === "string"
      ? value.replace(/,/g, "").trim()
      : value
  );

  return Number.isFinite(n) ? n : fallback;
}

function cleanImages(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((url) => String(url || "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

function normalizeHeader(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function normalizeImportedRow(row: Record<string, unknown>) {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    const normalized = normalizeHeader(key);

    if (
      normalized === "sku" ||
      normalized === "productcode" ||
      normalized === "productid" ||
      normalized === "itemcode"
    ) {
      result.sku = value;
    } else if (normalized === "brand") {
      result.brand = value;
    } else if (
      normalized === "name" ||
      normalized === "productname" ||
      normalized === "producttitle" ||
      normalized === "title"
    ) {
      result.name = value;
    } else if (
      normalized === "category" ||
      normalized === "categoryname"
    ) {
      result.category = value;
    } else if (
      normalized === "description" ||
      normalized === "details" ||
      normalized === "productdescription"
    ) {
      result.description = value;
    } else if (
      normalized === "price" ||
      normalized === "retailprice" ||
      normalized === "sellingprice"
    ) {
      result.price = value;
    } else if (
      normalized === "wholesaleprice" ||
      normalized === "wholesale" ||
      normalized === "dealerprice" ||
      normalized === "b2bprice"
    ) {
      result.wholesalePrice = value;
    } else if (
      normalized === "stock" ||
      normalized === "quantity" ||
      normalized === "qty"
    ) {
      result.stock = value;
    } else if (
      normalized === "image" ||
      normalized === "imageurl" ||
      normalized === "image1"
    ) {
      result.imageUrl = value;
    } else if (
      normalized === "imageurl2" ||
      normalized === "image2"
    ) {
      result.imageUrl2 = value;
    } else if (
      normalized === "imageurl3" ||
      normalized === "image3"
    ) {
      result.imageUrl3 = value;
    }
  }

  return result;
}

function parseSpreadsheet(buffer: Buffer) {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("The uploaded file does not contain a sheet.");
  }

  const sheet = workbook.Sheets[firstSheetName];

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    sheet,
    {
      defval: "",
      raw: true,
    }
  );

  return rawRows.map(normalizeImportedRow);
}

async function importProducts(
  products: any[],
  storeId: string
) {
  if (!products.length) {
    throw new Error("No products were supplied.");
  }

  if (products.length > 2000) {
    throw new Error(
      "Maximum 2000 products can be imported at one time."
    );
  }

  const errors: {
    row: number;
    error: string;
  }[] = [];

  const prepared: {
    sku: string | null;
    brand: string | null;
    name: string;
    description: string | null;
    price: number;
    wholesalePrice: number;
    stock: number;
    categoryName: string;
    images: string[];
  }[] = [];

  products.forEach((item: any, index: number) => {
    const rowNumber = index + 2;

    const sku = String(
      item.sku || ""
    ).trim();

    const brand = String(
      item.brand || ""
    ).trim();

    const name = String(
      item.name || ""
    ).trim();

    const categoryName =
      String(
        item.category || "Optical wholesale"
      ).trim() || "Optical wholesale";

    const description = String(
      item.description || ""
    ).trim();

    const wholesalePrice = numberValue(
      item.wholesalePrice
    );

    const priceValue = numberValue(
      item.price
    );

    const price =
      priceValue > 0
        ? priceValue
        : wholesalePrice;

    const stockValue = numberValue(
      item.stock
    );

    const stock = Math.max(
      0,
      Math.floor(stockValue)
    );

    const images = cleanImages(
      item.images || [
        item.imageUrl,
        item.imageUrl2,
        item.imageUrl3,
      ]
    );

    if (!name) {
      errors.push({
        row: rowNumber,
        error: "Product name is missing.",
      });

      return;
    }

    if (
      !Number.isFinite(wholesalePrice) ||
      wholesalePrice <= 0
    ) {
      errors.push({
        row: rowNumber,
        error:
          "Wholesale price must be greater than 0.",
      });

      return;
    }

    if (
      !Number.isFinite(stockValue) ||
      stockValue < 0
    ) {
      errors.push({
        row: rowNumber,
        error:
          "Stock must be zero or greater.",
      });

      return;
    }

    prepared.push({
      sku: sku || null,
      brand: brand || null,
      name,
      description: description || null,
      price,
      wholesalePrice,
      stock,
      categoryName,
      images,
    });
  });

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  let created = 0;
  let updated = 0;

  await prisma.$transaction(
    async (tx) => {
      for (const item of prepared) {
        const category =
          await tx.category.upsert({
            where: {
              name: item.categoryName,
            },
            create: {
              name: item.categoryName,
            },
            update: {},
          });

        let existing = null;

        if (item.sku) {
          existing =
            await tx.product.findFirst({
              where: {
                sku: item.sku,
                wholesaleStoreId: storeId,
              },
              include: {
                images: true,
              },
            });
        }

        if (existing) {
          await tx.product.update({
            where: {
              id: existing.id,
            },

            data: {
              name: item.name,
              brand: item.brand,
              description: item.description,
              price: item.price,
              wholesalePrice:
                item.wholesalePrice,
              stock: item.stock,

              status:
                item.stock > 0
                  ? "ACTIVE"
                  : "OUT_OF_STOCK",

              visibility: "WHOLESALE",

              categoryId: category.id,
            },
          });

          if (item.images.length > 0) {
            await tx.productImage.deleteMany({
              where: {
                productId: existing.id,
              },
            });

            await tx.productImage.createMany({
              data: item.images.map(
                (url) => ({
                  url,
                  productId: existing.id,
                })
              ),
            });
          }

          updated++;
        } else {
          await tx.product.create({
            data: {
              sku: item.sku,
              brand: item.brand,

              name: item.name,

              description:
                item.description,

              price: item.price,

              wholesalePrice:
                item.wholesalePrice,

              stock: item.stock,

              status:
                item.stock > 0
                  ? "ACTIVE"
                  : "OUT_OF_STOCK",

              visibility: "WHOLESALE",

              wholesaleStoreId:
                storeId,

              categoryId:
                category.id,

              images: {
                create:
                  item.images.map(
                    (url) => ({
                      url,
                    })
                  ),
              },
            },
          });

          created++;
        }
      }
    },
    {
      timeout: 120000,
    }
  );

  return {
    success: true,
    imported: created + updated,
    created,
    updated,
  };
}

export async function GET() {
  const session = await getUserSession();

  if (!session || !allowed(session.role)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const store =
    await prisma.wholesaleStore.findUnique({
      where: {
        ownerId: session.userId,
      },
    });

  if (!store) {
    return NextResponse.json({
      products: [],
    });
  }

  const products =
    await prisma.product.findMany({
      where: {
        wholesaleStoreId: store.id,
      },

      include: {
        images: true,
        category: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return NextResponse.json({
    products,
  });
}

export async function POST(
  req: NextRequest
) {
  const session = await getUserSession();

  if (!session || !allowed(session.role)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const store =
    await prisma.wholesaleStore.findUnique({
      where: {
        ownerId: session.userId,
      },
    });

  if (!store) {
    return NextResponse.json(
      {
        error:
          "Create wholesale store first.",
      },
      { status: 400 }
    );
  }

  const contentType =
    req.headers.get("content-type") || "";

  /*
   * ============================================================
   * CSV / XLSX / XLS FILE IMPORT
   * ============================================================
   */

  if (
    contentType.includes(
      "multipart/form-data"
    )
  ) {
    try {
      const formData =
        await req.formData();

      const file =
        formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json(
          {
            error:
              "Please select a CSV or Excel file.",
          },
          { status: 400 }
        );
      }

      if (file.size === 0) {
        return NextResponse.json(
          {
            error:
              "The uploaded file is empty.",
          },
          { status: 400 }
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            error:
              "Maximum file size is 10 MB.",
          },
          { status: 400 }
        );
      }

      const fileName =
        file.name.toLowerCase();

      const supported =
        fileName.endsWith(".csv") ||
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls");

      if (!supported) {
        return NextResponse.json(
          {
            error:
              "Only CSV, XLSX and XLS files are supported.",
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(
        await file.arrayBuffer()
      );

      const rows =
        parseSpreadsheet(buffer);

      if (!rows.length) {
        return NextResponse.json(
          {
            error:
              "No product rows were found in the file.",
          },
          { status: 400 }
        );
      }

      const result =
        await importProducts(
          rows,
          store.id
        );

      if (!result.success) {
        return NextResponse.json(
          {
            error:
              "Some rows contain errors. Correct them and upload again.",
            errors:
              result.errors,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        result
      );
    } catch (error) {
      console.error(
        "Spreadsheet import error:",
        error
      );

      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "The file could not be imported.",
        },
        { status: 500 }
      );
    }
  }

  /*
   * ============================================================
   * JSON REQUEST
   * ============================================================
   */

  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid request body.",
      },
      { status: 400 }
    );
  }

  /*
   * ============================================================
   * JSON BULK IMPORT
   * ============================================================
   */

  if (body.bulk === true) {
    const products =
      Array.isArray(body.products)
        ? body.products
        : [];

    if (!products.length) {
      return NextResponse.json(
        {
          error:
            "No products were supplied.",
        },
        { status: 400 }
      );
    }

    try {
      const result =
        await importProducts(
          products,
          store.id
        );

      if (!result.success) {
        return NextResponse.json(
          {
            error:
              "Some rows contain errors. Correct them and upload again.",
            errors:
              result.errors,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        result
      );
    } catch (error) {
      console.error(
        "Bulk product import error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "The products could not be imported. No products were added or updated.",
        },
        { status: 500 }
      );
    }
  }

  /*
   * ============================================================
   * NORMAL SINGLE PRODUCT
   * ============================================================
   */

  const name = String(
    body.name || ""
  ).trim();

  const sku = String(
    body.sku || ""
  ).trim();

  const brand = String(
    body.brand || ""
  ).trim();

  const price = numberValue(
    body.price
  );

  const wholesalePrice =
    numberValue(
      body.wholesalePrice
    );

  const stock = Math.max(
    0,
    Math.floor(
      numberValue(body.stock)
    )
  );

  if (!name || wholesalePrice <= 0) {
    return NextResponse.json(
      {
        error:
          "Product name and wholesale price are required.",
      },
      { status: 400 }
    );
  }

  const categoryName =
    String(
      body.category ||
        "Wholesale"
    ).trim() || "Wholesale";

  const category =
    await prisma.category.upsert({
      where: {
        name: categoryName,
      },
      create: {
        name: categoryName,
      },
      update: {},
    });

  const images = cleanImages(
    body.images
  );

  /*
   * SKU UPDATE
   */

  if (sku) {
    const existing =
      await prisma.product.findFirst({
        where: {
          sku,
          wholesaleStoreId:
            store.id,
        },
      });

    if (existing) {
      const product =
        await prisma.product.update({
          where: {
            id: existing.id,
          },

          data: {
            name,

            brand:
              brand || null,

            description:
              body.description
                ? String(
                    body.description
                  )
                : null,

            price:
              price > 0
                ? price
                : wholesalePrice,

            wholesalePrice,

            stock,

            status:
              stock > 0
                ? "ACTIVE"
                : "OUT_OF_STOCK",

            visibility:
              "WHOLESALE",

            categoryId:
              category.id,
          },

          include: {
            images: true,
            category: true,
          },
        });

      if (images.length > 0) {
        await prisma.productImage.deleteMany(
          {
            where: {
              productId:
                existing.id,
            },
          }
        );

        await prisma.productImage.createMany(
          {
            data: images.map(
              (url) => ({
                url,
                productId:
                  existing.id,
              })
            ),
          }
        );
      }

      return NextResponse.json({
        success: true,
        updated: true,
        product,
      });
    }
  }

  /*
   * CREATE SINGLE PRODUCT
   */

  const product =
    await prisma.product.create({
      data: {
        sku: sku || null,

        brand:
          brand || null,

        name,

        description:
          body.description
            ? String(
                body.description
              )
            : null,

        price:
          price > 0
            ? price
            : wholesalePrice,

        wholesalePrice,

        stock,

        status:
          stock > 0
            ? "ACTIVE"
            : "OUT_OF_STOCK",

        visibility:
          "WHOLESALE",

        wholesaleStoreId:
          store.id,

        categoryId:
          category.id,

        images: {
          create:
            images.map(
              (url) => ({
                url,
              })
            ),
        },
      },

      include: {
        images: true,
        category: true,
      },
    });

  return NextResponse.json(
    {
      success: true,
      created: true,
      product,
    },
    {
      status: 201,
    }
  );
}