#ifndef _CAMERA_H_
#define _CAMERA_H_

#include <stdlib.h>
#include "GL/glew.h"
#include "AVTmathLib.h"
#include "Vec3.h"


class Camera {

public:
	
	Camera() {}
	virtual ~Camera() {}
	virtual void setRatio(float _ratio) = 0;
	virtual void doProjection() = 0;
	virtual void doView() = 0;
};

#endif