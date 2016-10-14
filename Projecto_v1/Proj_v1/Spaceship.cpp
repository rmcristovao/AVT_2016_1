#include "Spaceship.h"


Spaceship::Spaceship(int _objId, int* addedToId, float _x, float _y, float _z) : DynamicObject(_objId,_x,_y, _z) {
	
	speed = Vec3(0.0f, 0.0f, 0.0f);
	accelerationModulus = Vec3(4.0f, 0, 0);
	maxSpeed = Vec3(4.0f, 0.0f, 0.0f);

	memcpy(mesh[objectId].mat.ambient, amb, 4 * sizeof(float));
	memcpy(mesh[objectId].mat.diffuse, diff, 4 * sizeof(float));
	memcpy(mesh[objectId].mat.specular, spec, 4 * sizeof(float));
	memcpy(mesh[objectId].mat.emissive, emissive, 4 * sizeof(float));
	mesh[objectId].mat.shininess = shininess;
	mesh[objectId].mat.texCount = texcount;
	//createQuad(1.5f,1.5f);

	createCube();
	*addedToId = addToId;
}

Spaceship::~Spaceship() {
	
}

void Spaceship::update(int delta) {
	float maxX = maxSpeed.getX();
	if (leftPressed) {
		speed = speed + accelerationModulus*(delta / 1000.0f);
		if (speed.getX() > maxX) speed.set(maxX, 0.0f, 0.0f);
	}
	else if (rightPressed) {
		speed = speed - accelerationModulus*(delta / 1000.0f);
		if (speed.getX() < -maxX) speed.set(-maxX, 0.0f, 0.0f);
	}
	else {
		float xspeed = speed.getX();
		if (0.05f <= xspeed)
			speed = speed - accelerationModulus*(delta / 1000.0f);
		else if (xspeed <= -0.05f)
			speed = speed + accelerationModulus*(delta / 1000.0f);
		else/* if (-0.05f < xspeed < 0.05f)*/ {
			speed.set(0.0f, 0.0f, 0.0f);
		}
	}
	position = position + speed*(delta / 1000.0f);
}

void Spaceship::updateKeys(bool left, bool right) {
	leftPressed = left;
	rightPressed = right;
}

void Spaceship::draw(VSShaderLib _shader) {
	pushMatrix(MODEL);

	GLint loc;
	// send the material
	loc = glGetUniformLocation(shader.getProgramIndex(), "mat.ambient");
	glUniform4fv(loc, 1, mesh[objectId].mat.ambient);
	loc = glGetUniformLocation(shader.getProgramIndex(), "mat.diffuse");
	glUniform4fv(loc, 1, mesh[objectId].mat.diffuse);
	loc = glGetUniformLocation(shader.getProgramIndex(), "mat.specular");
	glUniform4fv(loc, 1, mesh[objectId].mat.specular);
	loc = glGetUniformLocation(shader.getProgramIndex(), "mat.shininess");
	glUniform1f(loc, mesh[objectId].mat.shininess);

	translate(MODEL, position.getX(), position.getY(), position.getZ());
	//translate(MODEL, -1.0f, 0.0f, -5.0f);
	scale(MODEL, 1.5f, 1.0f, 1.0f);
	
	
	// send matrices to OGL
	computeDerivedMatrix(PROJ_VIEW_MODEL);
	glUniformMatrix4fv(vm_uniformId, 1, GL_FALSE, mCompMatrix[VIEW_MODEL]);
	glUniformMatrix4fv(pvm_uniformId, 1, GL_FALSE, mCompMatrix[PROJ_VIEW_MODEL]);
	computeNormalMatrix3x3();
	glUniformMatrix3fv(normal_uniformId, 1, GL_FALSE, mNormal3x3);

	// Render mesh
	glBindVertexArray(mesh[objectId].vao);
	glDrawElements(mesh[objectId].type, mesh[objectId].numIndexes, GL_UNSIGNED_INT, 0);
	glBindVertexArray(0);

	popMatrix(MODEL);
}

