import { FilterQuery } from "mongoose";
import { ObjectId } from 'mongodb';
import { HttpException } from "@nestjs/common";

export class ResultHandleSearch {
    filterQuery: FilterQuery<any>;
    sortQuery: Record<string, 1 | -1>;
    projection: Record<string, any>;
}

export function handleSearch(queryParams: any): ResultHandleSearch {

    const filterQuery: FilterQuery<any> = {};
    const sortQuery: Record<string, 1 | -1> = {};
    const projection: Record<string, any> = {};

    Object.keys(queryParams).forEach((key) => {
        let new_key = key.replace(/\\/g, '');
        queryParams[new_key] = queryParams[key];
        if (new_key !== key) delete queryParams[key];
        if (new_key.includes('=')) {
            const arr = new_key.split('=');
            queryParams[arr[0]] = arr[1];
            delete queryParams[new_key];
        }
    });

    const handleSearchSign = (key_sign: string, key: string, operator: "or" | "and" = "and") => {
        const values = Array.isArray(queryParams[key]) ? queryParams[key] : [queryParams[key]];
        const match = key.match(new RegExp(`^${key_sign}\\[(.+?)(:(.+))?\\]$`));
        const handleAddData = (key: string, value: any) => {
            if (operator === 'or') {
                if (!filterQuery["$or"]) filterQuery["$or"] = [];
                filterQuery["$or"].push({ [key]: value });
            } else if (operator === 'and') {
                filterQuery[key] = value;
            }
        };
        for (const value of values) {
            if (match) {
                const field = match[1];
                const operator = match[3] || '';
                if (operator === 'contains') {
                    // Tìm kiếm mẫu (pattern matching)
                    const regexValue = value.replace(/%/g, '.*');
                    handleAddData(field, { $regex: regexValue, $options: 'i' });
                } else if (operator === 'doesNotContain') {
                    // Tìm kiếm không chứa
                    const regexValue = value.replace(/%/g, '.*');
                    handleAddData(field, { $not: { $regex: regexValue, $options: 'i' } });
                } else if (operator === 'in') {
                    // check if field name is _id then convert value to ObjectId
                    if (field === '_id' || field.endsWith('._id')) {
                        handleAddData(field, {
                            $in: value.split(',').map((v) => {
                                const trimmedValue = v.trim();
                                // Kiểm tra nếu là ObjectId hợp lệ, chuyển đổi, nếu không thì giữ nguyên
                                return v === 'null' ? null : (ObjectId.isValid(trimmedValue) ? new ObjectId(trimmedValue) : trimmedValue);
                            })
                        });
                    } else {
                        handleAddData(field, {
                            $in: value.split(',').map((v) => v === 'null' ? null : v.trim())
                        });
                    }
                } else if (operator === 'beginsWith') {
                    // Tìm kiếm ký tự bắt đầu
                    handleAddData(field, { $regex: `^${value}`, $options: 'i' });
                } else if (operator === 'endsWith') {
                    // Tìm kiếm ký tự kết thúc
                    handleAddData(field, { $regex: `${value}$`, $options: 'i' });
                } else if (operator === 'range') {
                    // Tìm kiếm trong khoảng
                    const [min, max] = value
                        .split(',')
                        .map((v) => parseFloat(v.trim()));
                    handleAddData(field, { $gte: min, $lte: max });
                } else if (operator === 'exists') {
                    // Tìm kiếm trường tồn tại
                    handleAddData(field, { $exists: value === 'true' });
                } else if (operator === 'notExists') {
                    // Tìm kiếm trường không tồn tại
                    handleAddData(field, { $exists: value === 'false' });
                } else if (operator === 'equal') {
                    if (value === 'true' || value === 'false') {
                        handleAddData(field, value === 'true');
                    } else if (field === '_id' || field.endsWith('._id')) {
                        // check if value is ObjectId
                        if (!ObjectId.isValid(value)) {
                            throw new HttpException(`Invalid request query: ${value}`, 400);
                        }
                        handleAddData(field, new ObjectId(value));
                    } else {
                        handleAddData(field, value);
                    }
                } else if (operator === 'notEqual') {
                    if (value === 'true' || value === 'false') {
                        handleAddData(field, { $ne: value === 'true' });
                    } else if (field === '_id' || field.endsWith('._id')) {
                        // check if value is ObjectId
                        if (!ObjectId.isValid(value)) {
                            throw new HttpException(`Invalid request query: ${value}`, 400);
                        }
                        handleAddData(field, { $ne: new ObjectId(value) });
                    } else {
                        handleAddData(field, { $ne: value });
                    }
                } else if (operator === 'gt') {
                    if (
                        /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2})?$/.test(value)
                        && !isNaN(Date.parse(value))
                    ) {
                        handleAddData(field, { $gt: new Date(value) });
                    } else {
                        handleAddData(field, { $gt: parseFloat(value) });
                    }
                } else if (operator === 'lt') {
                    if (
                        /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2})?$/.test(value)
                        && !isNaN(Date.parse(value))
                    ) {
                        handleAddData(field, { $lt: new Date(value) });
                    } else {
                        handleAddData(field, { $lt: parseFloat(value) });
                    }
                } else if (operator === 'gte') {
                    if (
                        /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2})?$/.test(value)
                        && !isNaN(Date.parse(value))
                    ) {
                        handleAddData(field, { $gte: new Date(value) });
                    } else {
                        handleAddData(field, { $gte: parseFloat(value) });
                    }
                } else if (operator === 'lte') {
                    if (
                        /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2})?$/.test(value)
                        && !isNaN(Date.parse(value))
                    ) {
                        handleAddData(field, { $lte: new Date(value) });
                    } else {
                        handleAddData(field, { $lte: parseFloat(value) });
                    }
                } else if (operator === 'notIn') {
                    // Tìm kiếm không trong danh sách
                    handleAddData(field, {
                        $nin: value.split(',').map((v) => v === 'null' ? null : v.trim())
                    });
                } else if (operator === 'size') {
                    // Tìm kiếm kích thước mảng
                    handleAddData(field, { $size: parseInt(value, 10) });
                } else if (operator === 'all') {
                    // Tìm kiếm tất cả các giá trị trong mảng
                    handleAddData(field, {
                        $all: value.split(',').map((v) => v.trim()),
                    });
                } else if (operator === 'elemMatch') {
                    // Tìm kiếm phần tử trong mảng phù hợp với tiêu chí
                    handleAddData(field, { $elemMatch: JSON.parse(value) });
                } else if (operator === 'between') {
                    const [startDate, endDate] = value.split(',');
                    if (
                        // check is number
                        !isNaN(startDate) && !isNaN(endDate)
                    ) {
                        handleAddData(field, {
                            $gte: parseFloat(startDate),
                            $lte: parseFloat(endDate),
                        });
                    }
                    else {
                        handleAddData(field, {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate),
                        });
                    }
                } else if (operator === 'notBetween') {
                    const [startDate, endDate] = value.split(',');
                    if (
                        // check is number
                        !isNaN(startDate) && !isNaN(endDate)
                    ) {
                        handleAddData(field, {
                            $lt: parseFloat(startDate),
                            $gt: parseFloat(endDate),
                        });
                    }
                    else {
                        handleAddData(field, {
                            $lt: new Date(startDate),
                            $gt: new Date(endDate),
                        });
                    }
                } else if (operator === 'null') {
                    // Tìm kiếm trường null
                    handleAddData(field, null);
                } else if (operator === 'notNull') {
                    // Tìm kiếm trường không null
                    handleAddData(field, { $ne: null });
                } else {
                    // Tìm kiếm chính xác
                    handleAddData(field, value.includes(',')
                        ? value.split(',').map((v) => v.trim())
                        : value
                    );
                }
            }
        }
    }

    // Xử lý các tham số tìm kiếm
    Object.keys(queryParams).forEach((key, value) => {

        if (key.startsWith('search[')) {
            handleSearchSign('search', key);
        } else if (key.startsWith('searchOr[')) {
            handleSearchSign('searchOr', key, 'or');
        }

        if (key.startsWith('sort[')) {
            const value = queryParams[key];
            const match = key.match(/^sort\[(.+)]$/);
            if (match) {
                const field = match[1];
                const direction = value === 'desc' ? -1 : 1;
                sortQuery[field] = direction;
            }
        }

        if (key.startsWith('projection[')) {
            const value = queryParams[key];
            const match = key.match(/^projection\[(.+)]$/);
            if (match) {
                const field = match[1];
                projection[field] = parseInt(value, 10);
            }
        }

    });

    if (!queryParams['sort[created_at]']) sortQuery['created_at'] = -1;

    return { filterQuery, sortQuery, projection };

}