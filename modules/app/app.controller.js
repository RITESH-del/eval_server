import * as service from "./app.service.js";

export const fetchLab = async (req, res, next) => {
  try {
    const labs = await service.fetchLab(req.params.id);
    // console.log(labs);
    res.json(labs);
  } catch (err) {
    next(err);
  }
}

export const handleSubmission = async (req, res, next) => {
    try {
        const data = await service.handleSubmission({
          ...req.validatedData,
          ip_address: req.ip
      });

        return res.status(200).json(data);
    } catch(err){
        next(err);
    }
}